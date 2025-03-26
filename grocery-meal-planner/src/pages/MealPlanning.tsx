import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { MdAdd, MdDelete, MdRefresh } from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import DateSelector from "../components/DateSelector";
import {
  getRecipes,
  getSnacks,
  getPlannedMeals,
  createPlannedMeal,
  createWeeklyMealPlan,
} from "../api/api";
import {
  Recipe,
  Snack,
  PlannedMeal,
  MealType,
  PlannedMealCreateRequest,
} from "../types";

const MealPlanning: React.FC = () => {
  const { selectedDate, setSelectedDate } = useAppContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [weekView, setWeekView] = useState<PlannedMeal[][]>(Array(7).fill([]));

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mealForm, setMealForm] = useState<{
    meal_type: MealType;
    servings: number;
    recipe_id?: number;
    snack_id?: number;
  }>({
    meal_type: MealType.BREAKFAST,
    servings: 1,
  });
  const [activeTab, setActiveTab] = useState<number>(0);
  const toast = useToast();

  // Helper to format date to ISO string (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Get start of week (Sunday) for the current selected date
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay(); // 0 for Sunday
    d.setDate(d.getDate() - day); // Go to Sunday
    return d;
  };

  // Get array of 7 dates for the week
  const getWeekDates = (startDate: Date): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  useEffect(() => {
    // Set week start date when selected date changes
    const newWeekStart = getWeekStart(selectedDate);
    setWeekStartDate(newWeekStart);
  }, [selectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get recipes and snacks
        const [recipesData, snacksData] = await Promise.all([
          getRecipes(),
          getSnacks(),
        ]);
        setRecipes(recipesData);
        setSnacks(snacksData);

        // Fetch planned meals for the week
        const weekDates = getWeekDates(weekStartDate);
        const startDateStr = formatDate(weekDates[0]);
        const endDateStr = formatDate(weekDates[6]);

        const mealsData = await getPlannedMeals(startDateStr, endDateStr);
        setPlannedMeals(mealsData);

        // Organize meals by day of week
        const weekViewData: PlannedMeal[][] = Array(7)
          .fill(null)
          .map(() => []);

        mealsData.forEach((meal) => {
          const mealDate = new Date(meal.date);
          const dayDiff = Math.floor(
            (mealDate.getTime() - weekStartDate.getTime()) /
              (24 * 60 * 60 * 1000),
          );

          if (dayDiff >= 0 && dayDiff < 7) {
            weekViewData[dayDiff].push(meal);
          }
        });

        setWeekView(weekViewData);
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "Failed to load meal planning data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [weekStartDate]);

  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMealForm({
      ...mealForm,
      meal_type: e.target.value as MealType,
    });
  };

  const handleServingsChange = (_: string, value: number) => {
    setMealForm({
      ...mealForm,
      servings: value,
    });
  };

  const handleItemSelect = (id: number, type: "recipe" | "snack") => {
    if (type === "recipe") {
      setMealForm({
        ...mealForm,
        recipe_id: id,
        snack_id: undefined,
      });
    } else {
      setMealForm({
        ...mealForm,
        recipe_id: undefined,
        snack_id: id,
      });
    }
  };

  const handleAddMeal = async () => {
    if (!mealForm.recipe_id && !mealForm.snack_id) {
      toast({
        title: "Error",
        description: "Please select a recipe or snack",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const plannedMeal: PlannedMealCreateRequest = {
      date: formatDate(selectedDate),
      meal_type: mealForm.meal_type,
      servings: mealForm.servings,
      recipe_id: mealForm.recipe_id,
      snack_id: mealForm.snack_id,
    };

    try {
      const createdMeal = await createPlannedMeal(plannedMeal);

      // Update state
      setPlannedMeals([...plannedMeals, createdMeal]);

      // Update week view
      const mealDate = new Date(createdMeal.date);
      const dayDiff = Math.floor(
        (mealDate.getTime() - weekStartDate.getTime()) / (24 * 60 * 60 * 1000),
      );

      if (dayDiff >= 0 && dayDiff < 7) {
        const newWeekView = [...weekView];
        newWeekView[dayDiff] = [...newWeekView[dayDiff], createdMeal];
        setWeekView(newWeekView);
      }

      toast({
        title: "Meal added",
        description: "The meal has been added to your plan.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setMealForm({
        meal_type: MealType.BREAKFAST,
        servings: 1,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add meal to plan.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getMealTypeLabel = (mealType: MealType): string => {
    switch (mealType) {
      case MealType.BREAKFAST:
        return "Breakfast";
      case MealType.LUNCH:
        return "Lunch";
      case MealType.DINNER:
        return "Dinner";
      case MealType.SNACK:
        return "Snack";
      default:
        return mealType;
    }
  };

  const weekDates = getWeekDates(weekStartDate);

  const formatDayLabel = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="lg">Meal Planning</Heading>
          <Button leftIcon={<MdAdd />} colorScheme="green" onClick={onOpen}>
            Add Meal
          </Button>
        </HStack>

        <DateSelector onDateChange={(date) => setSelectedDate(date)} />

        <Tabs
          variant="enclosed"
          colorScheme="green"
          index={activeTab}
          onChange={setActiveTab}
        >
          <TabList>
            <Tab>Day View</Tab>
            <Tab>Week View</Tab>
          </TabList>

          <TabPanels>
            {/* Day View */}
            <TabPanel px={0}>
              <VStack spacing={4} align="stretch">
                {Object.values(MealType).map((mealType) => {
                  const meals = plannedMeals.filter(
                    (meal) =>
                      new Date(meal.date).toDateString() ===
                        selectedDate.toDateString() &&
                      meal.meal_type === mealType,
                  );

                  return (
                    <Card key={mealType} variant="outline">
                      <CardHeader pb={2} bg="gray.50">
                        <HStack justifyContent="space-between">
                          <Heading size="sm">
                            {getMealTypeLabel(mealType)}
                          </Heading>
                          <Button
                            size="sm"
                            leftIcon={<MdAdd />}
                            onClick={() => {
                              setMealForm({
                                ...mealForm,
                                meal_type: mealType,
                              });
                              onOpen();
                            }}
                          >
                            Add
                          </Button>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        {meals.length > 0 ? (
                          <VStack spacing={2} align="stretch">
                            {meals.map((meal) => {
                              const itemName = meal.recipe_id
                                ? recipes.find((r) => r.id === meal.recipe_id)
                                    ?.name
                                : snacks.find((s) => s.id === meal.snack_id)
                                    ?.name;

                              return (
                                <HStack
                                  key={meal.id}
                                  p={2}
                                  borderWidth="1px"
                                  borderRadius="md"
                                  justify="space-between"
                                >
                                  <HStack>
                                    <Badge
                                      colorScheme={
                                        meal.recipe_id ? "green" : "blue"
                                      }
                                    >
                                      {meal.recipe_id ? "Recipe" : "Snack"}
                                    </Badge>
                                    <Text>{itemName || "Unknown"}</Text>
                                  </HStack>
                                  <Text color="gray.500">
                                    {meal.servings} serving(s)
                                  </Text>
                                </HStack>
                              );
                            })}
                          </VStack>
                        ) : (
                          <Text color="gray.500" py={2}>
                            No meals planned
                          </Text>
                        )}
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </TabPanel>

            {/* Week View */}
            <TabPanel px={0}>
              <SimpleGrid columns={7} spacing={2}>
                {weekDates.map((date, dayIndex) => (
                  <Box
                    key={dayIndex}
                    onClick={() => setSelectedDate(date)}
                    cursor="pointer"
                  >
                    <Box
                      p={2}
                      bg={isToday(date) ? "green.100" : "gray.50"}
                      borderRadius="md"
                      fontWeight={isToday(date) ? "bold" : "normal"}
                      textAlign="center"
                      fontSize="sm"
                      mb={2}
                    >
                      {formatDayLabel(date)}
                    </Box>

                    <VStack
                      spacing={1}
                      align="stretch"
                      bg={
                        date.toDateString() === selectedDate.toDateString()
                          ? "green.50"
                          : "white"
                      }
                      p={2}
                      borderRadius="md"
                      borderWidth="1px"
                      h="180px"
                      overflowY="auto"
                    >
                      {weekView[dayIndex] && weekView[dayIndex].length > 0 ? (
                        weekView[dayIndex].map((meal) => {
                          const itemName = meal.recipe_id
                            ? recipes.find((r) => r.id === meal.recipe_id)?.name
                            : snacks.find((s) => s.id === meal.snack_id)?.name;

                          return (
                            <Box
                              key={meal.id}
                              p={1.5}
                              borderWidth="1px"
                              borderRadius="sm"
                              fontSize="xs"
                              bg={meal.recipe_id ? "green.50" : "blue.50"}
                            >
                              <Text fontWeight="bold" fontSize="xs">
                                {getMealTypeLabel(meal.meal_type)}
                              </Text>
                              <Text noOfLines={1}>{itemName}</Text>
                            </Box>
                          );
                        })
                      ) : (
                        <Text
                          color="gray.400"
                          fontSize="xs"
                          textAlign="center"
                          py={2}
                        >
                          No meals
                        </Text>
                      )}
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Add Meal Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Meal to Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontWeight="medium">
                Date:{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>

              <FormControl>
                <FormLabel>Meal Type</FormLabel>
                <Select
                  value={mealForm.meal_type}
                  onChange={handleMealTypeChange}
                >
                  {Object.values(MealType).map((type) => (
                    <option key={type} value={type}>
                      {getMealTypeLabel(type)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Servings</FormLabel>
                <NumberInput
                  min={0.5}
                  step={0.5}
                  value={mealForm.servings}
                  onChange={handleServingsChange}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Tabs isFitted variant="line" colorScheme="green">
                <TabList>
                  <Tab>Recipes</Tab>
                  <Tab>Snacks</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack
                      spacing={2}
                      align="stretch"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {recipes.map((recipe) => (
                        <Box
                          key={recipe.id}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          cursor="pointer"
                          bg={
                            mealForm.recipe_id === recipe.id
                              ? "green.100"
                              : "white"
                          }
                          onClick={() => handleItemSelect(recipe.id, "recipe")}
                        >
                          <Text fontWeight="medium">{recipe.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {recipe.calories_per_serving} cal |{" "}
                            {recipe.protein_per_serving}g protein
                          </Text>
                        </Box>
                      ))}
                      {recipes.length === 0 && (
                        <Text color="gray.500" textAlign="center">
                          No recipes available
                        </Text>
                      )}
                    </VStack>
                  </TabPanel>
                  <TabPanel>
                    <VStack
                      spacing={2}
                      align="stretch"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {snacks.map((snack) => (
                        <Box
                          key={snack.id}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          cursor="pointer"
                          bg={
                            mealForm.snack_id === snack.id
                              ? "blue.100"
                              : "white"
                          }
                          onClick={() => handleItemSelect(snack.id, "snack")}
                        >
                          <Text fontWeight="medium">{snack.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {snack.calories_per_serving} cal |{" "}
                            {snack.protein_per_serving}g protein
                          </Text>
                        </Box>
                      ))}
                      {snacks.length === 0 && (
                        <Text color="gray.500" textAlign="center">
                          No snacks available
                        </Text>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddMeal}>
              Add to Plan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MealPlanning;
