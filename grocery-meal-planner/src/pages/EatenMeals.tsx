import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Select,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Spinner,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import {
  MdAdd,
  MdFastfood,
  MdRestaurantMenu,
  MdRestaurant,
} from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import DateSelector from "../components/DateSelector";
import {
  getRecipes,
  getSnacks,
  getCookedMeal,
  recordEatenOut,
  recordEatenMeal,
  getDailyMacros,
} from "../api/api";
import {
  Recipe,
  Snack,
  CookedMeal,
  EatenOut,
  MealType,
  MacrosSummary,
  EatenMealCreateRequest,
  EatenOutCreateRequest,
} from "../types";

const EatenMeals: React.FC = () => {
  const { selectedDate, cookedMeals, setCookedMeals } = useAppContext();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [availableCookedMeals, setAvailableCookedMeals] = useState<
    CookedMeal[]
  >([]);
  const [eatenOutMeals, setEatenOutMeals] = useState<EatenOut[]>([]);
  const [dailyMacros, setDailyMacros] = useState<MacrosSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    isOpen: isEatenMealOpen,
    onOpen: onEatenMealOpen,
    onClose: onEatenMealClose,
  } = useDisclosure();
  const {
    isOpen: isEatenOutOpen,
    onOpen: onEatenOutOpen,
    onClose: onEatenOutClose,
  } = useDisclosure();

  const [eatenMealForm, setEatenMealForm] = useState<{
    meal_type: MealType;
    servings: number;
    cooked_meal_id?: number;
    snack_id?: number;
  }>({
    meal_type: MealType.BREAKFAST,
    servings: 1,
  });

  const [eatenOutForm, setEatenOutForm] = useState<{
    restaurant: string;
    meal_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servings_total: number;
    servings_remaining: number;
    meal_type: MealType;
  }>({
    restaurant: "",
    meal_name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servings_total: 1,
    servings_remaining: 0,
    meal_type: MealType.LUNCH,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const toast = useToast();

  // Format date to ISO string (YYYY-MM-DD)
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch necessary data
        const [recipesData, snacksData, cookedMealsData] = await Promise.all([
          getRecipes(),
          getSnacks(),
          cookedMeals.length > 0 ? cookedMeals : getCookedMeal(), // This endpoint will need to be implemented on backend
        ]);

        setRecipes(recipesData);
        setSnacks(snacksData);
        if (cookedMeals.length === 0) {
          setCookedMeals(cookedMealsData);
        }
        setAvailableCookedMeals(cookedMealsData);

        // Fetch daily macros
        const macrosData = await getDailyMacros(formatDate(selectedDate));
        setDailyMacros(macrosData);

        // Reset form defaults if we have data
        if (cookedMealsData.length > 0) {
          setEatenMealForm({
            ...eatenMealForm,
            cooked_meal_id: cookedMealsData[0].id,
          });
        } else if (snacksData.length > 0) {
          setEatenMealForm({
            ...eatenMealForm,
            cooked_meal_id: undefined,
            snack_id: snacksData[0].id,
          });
        }
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "Failed to load required data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleRecordEatenMeal = async () => {
    if (!eatenMealForm.cooked_meal_id && !eatenMealForm.snack_id) {
      toast({
        title: "Error",
        description: "Please select a cooked meal or snack",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const mealRequest: EatenMealCreateRequest = {
        meal_type: eatenMealForm.meal_type,
        servings: eatenMealForm.servings,
        cooked_meal_id: eatenMealForm.cooked_meal_id,
        snack_id: eatenMealForm.snack_id,
      };

      await recordEatenMeal(mealRequest);

      toast({
        title: "Meal recorded",
        description: "Your meal has been recorded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the macros and available meals
      const macrosData = await getDailyMacros(formatDate(selectedDate));
      setDailyMacros(macrosData);

      const cookedMealsData = await getCookedMeal();
      setCookedMeals(cookedMealsData);
      setAvailableCookedMeals(cookedMealsData);

      // Reset form and close modal
      setEatenMealForm({
        meal_type: MealType.BREAKFAST,
        servings: 1,
      });
      onEatenMealClose();
    } catch (error) {
      toast({
        title: "Error recording meal",
        description: "Failed to record your meal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordEatenOut = async () => {
    if (!eatenOutForm.restaurant || !eatenOutForm.meal_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First, create the eaten out record
      const eatenOutRequest: EatenOutCreateRequest = {
        restaurant: eatenOutForm.restaurant,
        meal_name: eatenOutForm.meal_name,
        calories: eatenOutForm.calories,
        protein: eatenOutForm.protein,
        carbs: eatenOutForm.carbs,
        fat: eatenOutForm.fat,
        servings_total: eatenOutForm.servings_total,
        servings_remaining: eatenOutForm.servings_remaining,
      };

      const eatenOutResult = await recordEatenOut(eatenOutRequest);

      // Then, record it as an eaten meal
      const eatenMealRequest: EatenMealCreateRequest = {
        meal_type: eatenOutForm.meal_type,
        servings: eatenOutForm.servings_total - eatenOutForm.servings_remaining,
        eaten_out_id: eatenOutResult.id,
      };

      await recordEatenMeal(eatenMealRequest);

      toast({
        title: "Meal recorded",
        description: "Your restaurant meal has been recorded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the macros
      const macrosData = await getDailyMacros(formatDate(selectedDate));
      setDailyMacros(macrosData);

      // Reset form and close modal
      setEatenOutForm({
        restaurant: "",
        meal_name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        servings_total: 1,
        servings_remaining: 0,
        meal_type: MealType.LUNCH,
      });
      onEatenOutClose();
    } catch (error) {
      toast({
        title: "Error recording meal",
        description: "Failed to record your restaurant meal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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

  const getCookedMealDetails = (
    id: number,
  ): { name: string; calories: number } => {
    const cookedMeal = availableCookedMeals.find((meal) => meal.id === id);
    if (!cookedMeal) return { name: "Unknown", calories: 0 };

    return {
      name: cookedMeal.recipe.name,
      calories: cookedMeal.recipe.calories_per_serving,
    };
  };

  const getSnackDetails = (id: number): { name: string; calories: number } => {
    const snack = snacks.find((s) => s.id === id);
    if (!snack) return { name: "Unknown", calories: 0 };

    return {
      name: snack.name,
      calories: snack.calories_per_serving,
    };
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="lg">Eaten Meals</Heading>
          <HStack spacing={2}>
            <Button
              leftIcon={<MdFastfood />}
              onClick={onEatenMealOpen}
              colorScheme="blue"
            >
              Log Meal
            </Button>
            <Button
              leftIcon={<MdRestaurant />}
              onClick={onEatenOutOpen}
              colorScheme="purple"
            >
              Log Restaurant
            </Button>
          </HStack>
        </HStack>

        <DateSelector />

        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : (
          <VStack spacing={6} align="stretch">
            {/* Macros Summary */}
            {dailyMacros && (
              <Card>
                <CardHeader>
                  <Heading size="md">
                    Nutrition Summary for{" "}
                    {new Date(dailyMacros.date).toLocaleDateString()}
                  </Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    <Box
                      p={4}
                      bg="green.50"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text color="gray.500">Calories</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {dailyMacros.total_calories}
                      </Text>
                    </Box>
                    <Box
                      p={4}
                      bg="blue.50"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text color="gray.500">Protein</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {dailyMacros.total_protein}g
                      </Text>
                    </Box>
                    <Box
                      p={4}
                      bg="orange.50"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text color="gray.500">Carbs</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {dailyMacros.total_carbs}g
                      </Text>
                    </Box>
                    <Box p={4} bg="red.50" borderRadius="md" textAlign="center">
                      <Text color="gray.500">Fat</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {dailyMacros.total_fat}g
                      </Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}

            {/* Meals List */}
            <Card>
              <CardHeader>
                <Heading size="md">
                  Meals for {selectedDate.toLocaleDateString()}
                </Heading>
              </CardHeader>
              <CardBody>
                {dailyMacros &&
                Object.keys(dailyMacros.meals).some(
                  (type) => dailyMacros.meals[type as MealType].length > 0,
                ) ? (
                  <VStack spacing={4} align="stretch">
                    {Object.entries(dailyMacros.meals).map(
                      ([mealType, meals]) => {
                        if (meals.length === 0) return null;

                        return (
                          <Box key={mealType}>
                            <Heading size="sm" mb={2}>
                              {getMealTypeLabel(mealType as MealType)}
                            </Heading>
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Food</Th>
                                  <Th>Type</Th>
                                  <Th isNumeric>Servings</Th>
                                  <Th isNumeric>Calories</Th>
                                  <Th isNumeric>Protein</Th>
                                  <Th isNumeric>Carbs</Th>
                                  <Th isNumeric>Fat</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {meals.map((meal, idx) => (
                                  <Tr key={idx}>
                                    <Td fontWeight="medium">{meal.name}</Td>
                                    <Td>
                                      <Badge
                                        colorScheme={
                                          meal.type === "cooked_meal"
                                            ? "green"
                                            : meal.type === "snack"
                                              ? "blue"
                                              : "purple"
                                        }
                                      >
                                        {meal.type === "cooked_meal"
                                          ? "Cooked"
                                          : meal.type === "snack"
                                            ? "Snack"
                                            : "Restaurant"}
                                      </Badge>
                                    </Td>
                                    <Td isNumeric>{meal.servings}</Td>
                                    <Td isNumeric>{meal.calories}</Td>
                                    <Td isNumeric>{meal.protein}g</Td>
                                    <Td isNumeric>{meal.carbs}g</Td>
                                    <Td isNumeric>{meal.fat}g</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </Box>
                        );
                      },
                    )}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={6}>
                    <Box fontSize="4xl" mb={4}>
                      <MdRestaurantMenu />
                    </Box>
                    <Text mb={4}>No meals recorded for this day.</Text>
                    <HStack spacing={4} justify="center">
                      <Button
                        leftIcon={<MdFastfood />}
                        onClick={onEatenMealOpen}
                      >
                        Log a Meal
                      </Button>
                      <Button
                        leftIcon={<MdRestaurant />}
                        onClick={onEatenOutOpen}
                      >
                        Log Restaurant Meal
                      </Button>
                    </HStack>
                  </Box>
                )}
              </CardBody>
            </Card>
          </VStack>
        )}
      </VStack>

      {/* Log Meal Modal */}
      <Modal isOpen={isEatenMealOpen} onClose={onEatenMealClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log a Meal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Meal Type</FormLabel>
                <Select
                  value={eatenMealForm.meal_type}
                  onChange={(e) =>
                    setEatenMealForm({
                      ...eatenMealForm,
                      meal_type: e.target.value as MealType,
                    })
                  }
                >
                  {Object.values(MealType).map((type) => (
                    <option key={type} value={type}>
                      {getMealTypeLabel(type)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Tabs isFitted variant="enclosed" colorScheme="blue">
                <TabList mb="1em">
                  <Tab>Cooked Meals</Tab>
                  <Tab>Snacks</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <FormControl isRequired>
                      <FormLabel>Select Cooked Meal</FormLabel>
                      <Select
                        placeholder={
                          availableCookedMeals.length === 0
                            ? "No cooked meals available"
                            : "Select a cooked meal"
                        }
                        isDisabled={availableCookedMeals.length === 0}
                        value={eatenMealForm.cooked_meal_id || ""}
                        onChange={(e) =>
                          setEatenMealForm({
                            ...eatenMealForm,
                            cooked_meal_id: Number(e.target.value),
                            snack_id: undefined,
                          })
                        }
                      >
                        {availableCookedMeals.map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.recipe.name} ({meal.servings_remaining}{" "}
                            servings left)
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    {eatenMealForm.cooked_meal_id && (
                      <Box mt={4} p={3} borderWidth="1px" borderRadius="md">
                        <Text fontWeight="medium">
                          {
                            getCookedMealDetails(eatenMealForm.cooked_meal_id)
                              .name
                          }
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {
                            getCookedMealDetails(eatenMealForm.cooked_meal_id)
                              .calories
                          }{" "}
                          calories per serving
                        </Text>
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel px={0}>
                    <FormControl isRequired>
                      <FormLabel>Select Snack</FormLabel>
                      <Select
                        placeholder={
                          snacks.length === 0
                            ? "No snacks available"
                            : "Select a snack"
                        }
                        isDisabled={snacks.length === 0}
                        value={eatenMealForm.snack_id || ""}
                        onChange={(e) =>
                          setEatenMealForm({
                            ...eatenMealForm,
                            snack_id: Number(e.target.value),
                            cooked_meal_id: undefined,
                          })
                        }
                      >
                        {snacks.map((snack) => (
                          <option key={snack.id} value={snack.id}>
                            {snack.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    {eatenMealForm.snack_id && (
                      <Box mt={4} p={3} borderWidth="1px" borderRadius="md">
                        <Text fontWeight="medium">
                          {getSnackDetails(eatenMealForm.snack_id).name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {getSnackDetails(eatenMealForm.snack_id).calories}{" "}
                          calories per serving
                        </Text>
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <FormControl isRequired>
                <FormLabel>Servings</FormLabel>
                <NumberInput
                  min={0.5}
                  step={0.5}
                  value={eatenMealForm.servings}
                  onChange={(_, value) =>
                    setEatenMealForm({ ...eatenMealForm, servings: value })
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEatenMealClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleRecordEatenMeal}
              isLoading={isSubmitting}
            >
              Log Meal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Log Restaurant Meal Modal */}
      <Modal isOpen={isEatenOutOpen} onClose={onEatenOutClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Restaurant Meal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Meal Type</FormLabel>
                <Select
                  value={eatenOutForm.meal_type}
                  onChange={(e) =>
                    setEatenOutForm({
                      ...eatenOutForm,
                      meal_type: e.target.value as MealType,
                    })
                  }
                >
                  {Object.values(MealType).map((type) => (
                    <option key={type} value={type}>
                      {getMealTypeLabel(type)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Restaurant</FormLabel>
                  <Input
                    value={eatenOutForm.restaurant}
                    onChange={(e) =>
                      setEatenOutForm({
                        ...eatenOutForm,
                        restaurant: e.target.value,
                      })
                    }
                    placeholder="Restaurant name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Meal</FormLabel>
                  <Input
                    value={eatenOutForm.meal_name}
                    onChange={(e) =>
                      setEatenOutForm({
                        ...eatenOutForm,
                        meal_name: e.target.value,
                      })
                    }
                    placeholder="What did you eat?"
                  />
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Heading size="sm">Nutrition Information</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Calories</FormLabel>
                  <NumberInput
                    min={0}
                    value={eatenOutForm.calories}
                    onChange={(_, value) =>
                      setEatenOutForm({ ...eatenOutForm, calories: value })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Protein (g)</FormLabel>
                  <NumberInput
                    min={0}
                    step={0.1}
                    value={eatenOutForm.protein}
                    onChange={(_, value) =>
                      setEatenOutForm({ ...eatenOutForm, protein: value })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Carbs (g)</FormLabel>
                  <NumberInput
                    min={0}
                    step={0.1}
                    value={eatenOutForm.carbs}
                    onChange={(_, value) =>
                      setEatenOutForm({ ...eatenOutForm, carbs: value })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fat (g)</FormLabel>
                  <NumberInput
                    min={0}
                    step={0.1}
                    value={eatenOutForm.fat}
                    onChange={(_, value) =>
                      setEatenOutForm({ ...eatenOutForm, fat: value })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <Divider />

              <Heading size="sm">Servings</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Total Servings</FormLabel>
                  <NumberInput
                    min={0.5}
                    step={0.5}
                    value={eatenOutForm.servings_total}
                    onChange={(_, value) =>
                      setEatenOutForm({
                        ...eatenOutForm,
                        servings_total: value,
                      })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Leftovers (Servings)</FormLabel>
                  <NumberInput
                    min={0}
                    max={eatenOutForm.servings_total}
                    step={0.5}
                    value={eatenOutForm.servings_remaining}
                    onChange={(_, value) =>
                      setEatenOutForm({
                        ...eatenOutForm,
                        servings_remaining: value,
                      })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEatenOutClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleRecordEatenOut}
              isLoading={isSubmitting}
            >
              Log Restaurant Meal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EatenMeals;
