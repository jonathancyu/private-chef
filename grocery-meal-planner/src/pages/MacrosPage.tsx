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
  Text,
  Button,
  Spinner,
  Select,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  MdArrowBack,
  MdArrowForward,
  MdCalendarToday,
  MdRestaurantMenu,
  MdShowChart,
} from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import DateSelector from "../components/DateSelector";
import { getDailyMacros } from "../api/api";
import { MacrosSummary, MealType } from "../types";

const MacrosPage: React.FC = () => {
  const { selectedDate, setSelectedDate } = useAppContext();
  const [dailyMacros, setDailyMacros] = useState<MacrosSummary | null>(null);
  const [weeklyMacros, setWeeklyMacros] = useState<MacrosSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const toast = useToast();

  // Goals
  const [goals] = useState({
    calories: 2000,
    protein: 120,
    carbs: 200,
    fat: 65,
  });

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
    const fetchDailyMacros = async () => {
      setIsLoading(true);
      try {
        const data = await getDailyMacros(formatDate(selectedDate));
        setDailyMacros(data);
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "Failed to load macros data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyMacros();
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchWeeklyMacros();
    }
  }, [activeTab]);

  const fetchWeeklyMacros = async () => {
    setIsLoading(true);
    try {
      const weekStart = getWeekStart(selectedDate);
      const weekDates = getWeekDates(weekStart);

      const weeklyData = await Promise.all(
        weekDates.map((date) => getDailyMacros(formatDate(date))),
      );

      setWeeklyMacros(weeklyData);
    } catch (error) {
      toast({
        title: "Error loading weekly data",
        description: "Failed to load weekly macros data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const calculatePercentage = (value: number, goal: number): number => {
    return Math.min(Math.round((value / goal) * 100), 100);
  };

  const getGoalStatus = (value: number, goal: number): string => {
    const percentage = (value / goal) * 100;
    if (percentage < 80) return "Under";
    if (percentage <= 110) return "On Target";
    return "Over";
  };

  const getStatusColor = (value: number, goal: number): string => {
    const status = getGoalStatus(value, goal);
    if (status === "Under") return "yellow.500";
    if (status === "On Target") return "green.500";
    return "red.500";
  };

  const getWeeklyAverages = (): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } => {
    if (weeklyMacros.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const total = weeklyMacros.reduce(
      (acc, day) => ({
        calories: acc.calories + day.total_calories,
        protein: acc.protein + day.total_protein,
        carbs: acc.carbs + day.total_carbs,
        fat: acc.fat + day.total_fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return {
      calories: Math.round(total.calories / weeklyMacros.length),
      protein: parseFloat((total.protein / weeklyMacros.length).toFixed(1)),
      carbs: parseFloat((total.carbs / weeklyMacros.length).toFixed(1)),
      fat: parseFloat((total.fat / weeklyMacros.length).toFixed(1)),
    };
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

  const statBg = useColorModeValue("white", "gray.700");
  const weeklyAverages = getWeeklyAverages();

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" mb={4}>
          Nutrition Analytics
        </Heading>

        <DateSelector />

        <Tabs colorScheme="blue" index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Daily View</Tab>
            <Tab>Weekly Overview</Tab>
          </TabList>

          <TabPanels>
            {/* Daily View */}
            <TabPanel px={0}>
              {isLoading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                </Box>
              ) : dailyMacros ? (
                <VStack spacing={6} align="stretch">
                  {/* Main Stats */}
                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Calories</StatLabel>
                          <StatNumber>{dailyMacros.total_calories}</StatNumber>
                          <StatHelpText
                            color={getStatusColor(
                              dailyMacros.total_calories,
                              goals.calories,
                            )}
                          >
                            {getGoalStatus(
                              dailyMacros.total_calories,
                              goals.calories,
                            )}{" "}
                            Goal ({goals.calories})
                          </StatHelpText>
                          <Progress
                            value={calculatePercentage(
                              dailyMacros.total_calories,
                              goals.calories,
                            )}
                            colorScheme="green"
                            size="sm"
                            borderRadius="full"
                          />
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Protein</StatLabel>
                          <StatNumber>{dailyMacros.total_protein}g</StatNumber>
                          <StatHelpText
                            color={getStatusColor(
                              dailyMacros.total_protein,
                              goals.protein,
                            )}
                          >
                            {getGoalStatus(
                              dailyMacros.total_protein,
                              goals.protein,
                            )}{" "}
                            Goal ({goals.protein}g)
                          </StatHelpText>
                          <Progress
                            value={calculatePercentage(
                              dailyMacros.total_protein,
                              goals.protein,
                            )}
                            colorScheme="blue"
                            size="sm"
                            borderRadius="full"
                          />
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Carbs</StatLabel>
                          <StatNumber>{dailyMacros.total_carbs}g</StatNumber>
                          <StatHelpText
                            color={getStatusColor(
                              dailyMacros.total_carbs,
                              goals.carbs,
                            )}
                          >
                            {getGoalStatus(
                              dailyMacros.total_carbs,
                              goals.carbs,
                            )}{" "}
                            Goal ({goals.carbs}g)
                          </StatHelpText>
                          <Progress
                            value={calculatePercentage(
                              dailyMacros.total_carbs,
                              goals.carbs,
                            )}
                            colorScheme="orange"
                            size="sm"
                            borderRadius="full"
                          />
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardBody>
                        <Stat>
                          <StatLabel>Fat</StatLabel>
                          <StatNumber>{dailyMacros.total_fat}g</StatNumber>
                          <StatHelpText
                            color={getStatusColor(
                              dailyMacros.total_fat,
                              goals.fat,
                            )}
                          >
                            {getGoalStatus(dailyMacros.total_fat, goals.fat)}{" "}
                            Goal ({goals.fat}g)
                          </StatHelpText>
                          <Progress
                            value={calculatePercentage(
                              dailyMacros.total_fat,
                              goals.fat,
                            )}
                            colorScheme="red"
                            size="sm"
                            borderRadius="full"
                          />
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Macro Distribution */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Macronutrient Distribution</Heading>
                    </CardHeader>
                    <CardBody>
                      <HStack spacing={6} height="80px">
                        {/* Protein */}
                        <Box flex="1" position="relative" height="100%">
                          <Box
                            position="absolute"
                            bottom="0"
                            width="100%"
                            height={`${((dailyMacros.total_protein * 4) / dailyMacros.total_calories) * 100}%`}
                            backgroundColor="blue.400"
                            borderTopRadius="md"
                          />
                          <Text
                            position="absolute"
                            bottom="0"
                            width="100%"
                            textAlign="center"
                            fontWeight="bold"
                            color="white"
                            pb="1"
                          >
                            {Math.round(
                              ((dailyMacros.total_protein * 4) /
                                dailyMacros.total_calories) *
                                100,
                            )}
                            %
                          </Text>
                          <Text
                            position="absolute"
                            bottom="-25px"
                            width="100%"
                            textAlign="center"
                            fontSize="sm"
                          >
                            Protein
                          </Text>
                        </Box>

                        {/* Carbs */}
                        <Box flex="1" position="relative" height="100%">
                          <Box
                            position="absolute"
                            bottom="0"
                            width="100%"
                            height={`${((dailyMacros.total_carbs * 4) / dailyMacros.total_calories) * 100}%`}
                            backgroundColor="orange.400"
                            borderTopRadius="md"
                          />
                          <Text
                            position="absolute"
                            bottom="0"
                            width="100%"
                            textAlign="center"
                            fontWeight="bold"
                            color="white"
                            pb="1"
                          >
                            {Math.round(
                              ((dailyMacros.total_carbs * 4) /
                                dailyMacros.total_calories) *
                                100,
                            )}
                            %
                          </Text>
                          <Text
                            position="absolute"
                            bottom="-25px"
                            width="100%"
                            textAlign="center"
                            fontSize="sm"
                          >
                            Carbs
                          </Text>
                        </Box>

                        {/* Fat */}
                        <Box flex="1" position="relative" height="100%">
                          <Box
                            position="absolute"
                            bottom="0"
                            width="100%"
                            height={`${((dailyMacros.total_fat * 9) / dailyMacros.total_calories) * 100}%`}
                            backgroundColor="red.400"
                            borderTopRadius="md"
                          />
                          <Text
                            position="absolute"
                            bottom="0"
                            width="100%"
                            textAlign="center"
                            fontWeight="bold"
                            color="white"
                            pb="1"
                          >
                            {Math.round(
                              ((dailyMacros.total_fat * 9) /
                                dailyMacros.total_calories) *
                                100,
                            )}
                            %
                          </Text>
                          <Text
                            position="absolute"
                            bottom="-25px"
                            width="100%"
                            textAlign="center"
                            fontSize="sm"
                          >
                            Fat
                          </Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>

                  {/* Meal Breakdown */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Meal Breakdown</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        {Object.entries(dailyMacros.meals).map(
                          ([mealType, meals]) => {
                            if (meals.length === 0) return null;

                            // Calculate meal totals
                            const mealTotals = meals.reduce(
                              (acc, meal) => ({
                                calories: acc.calories + meal.calories,
                                protein: acc.protein + meal.protein,
                                carbs: acc.carbs + meal.carbs,
                                fat: acc.fat + meal.fat,
                              }),
                              { calories: 0, protein: 0, carbs: 0, fat: 0 },
                            );

                            return (
                              <Box key={mealType}>
                                <HStack justifyContent="space-between" mb={2}>
                                  <Heading size="sm">
                                    {getMealTypeLabel(mealType as MealType)}
                                  </Heading>
                                  <HStack spacing={4}>
                                    <Text fontSize="sm" color="gray.500">
                                      {mealTotals.calories} cal
                                    </Text>
                                    <Text fontSize="sm" color="blue.500">
                                      {mealTotals.protein}g P
                                    </Text>
                                    <Text fontSize="sm" color="orange.500">
                                      {mealTotals.carbs}g C
                                    </Text>
                                    <Text fontSize="sm" color="red.500">
                                      {mealTotals.fat}g F
                                    </Text>
                                  </HStack>
                                </HStack>

                                <Table variant="simple" size="sm">
                                  <Thead>
                                    <Tr>
                                      <Th>Food</Th>
                                      <Th>Type</Th>
                                      <Th isNumeric>Servings</Th>
                                      <Th isNumeric>Calories</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {meals.map((meal, idx) => (
                                      <Tr key={idx}>
                                        <Td>{meal.name}</Td>
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
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </Box>
                            );
                          },
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              ) : (
                <Box textAlign="center" py={10}>
                  <Box fontSize="4xl" mb={4}>
                    <MdRestaurantMenu />
                  </Box>
                  <Text mb={4}>No nutrition data available for this day.</Text>
                  <Button
                    colorScheme="blue"
                    onClick={() => navigate("/eaten-meals")}
                  >
                    Log Meals
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Weekly Overview */}
            <TabPanel px={0}>
              {isLoading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="xl" />
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  {/* Weekly Averages */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Weekly Averages</Heading>
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
                            {weeklyAverages.calories}
                          </Text>
                          <Text
                            fontSize="sm"
                            color={getStatusColor(
                              weeklyAverages.calories,
                              goals.calories,
                            )}
                          >
                            {getGoalStatus(
                              weeklyAverages.calories,
                              goals.calories,
                            )}{" "}
                            Daily Goal
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
                            {weeklyAverages.protein}g
                          </Text>
                          <Text
                            fontSize="sm"
                            color={getStatusColor(
                              weeklyAverages.protein,
                              goals.protein,
                            )}
                          >
                            {getGoalStatus(
                              weeklyAverages.protein,
                              goals.protein,
                            )}{" "}
                            Daily Goal
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
                            {weeklyAverages.carbs}g
                          </Text>
                          <Text
                            fontSize="sm"
                            color={getStatusColor(
                              weeklyAverages.carbs,
                              goals.carbs,
                            )}
                          >
                            {getGoalStatus(weeklyAverages.carbs, goals.carbs)}{" "}
                            Daily Goal
                          </Text>
                        </Box>
                        <Box
                          p={4}
                          bg="red.50"
                          borderRadius="md"
                          textAlign="center"
                        >
                          <Text color="gray.500">Fat</Text>
                          <Text fontSize="2xl" fontWeight="bold">
                            {weeklyAverages.fat}g
                          </Text>
                          <Text
                            fontSize="sm"
                            color={getStatusColor(
                              weeklyAverages.fat,
                              goals.fat,
                            )}
                          >
                            {getGoalStatus(weeklyAverages.fat, goals.fat)} Daily
                            Goal
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Weekly Chart */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Weekly Calorie Intake</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="200px" position="relative">
                        <Box
                          position="absolute"
                          left="0"
                          right="0"
                          top="50%"
                          height="1px"
                          bg="gray.200"
                        />
                        <Text
                          position="absolute"
                          right="0"
                          top="50%"
                          transform="translateY(-50%)"
                          fontSize="xs"
                          color="gray.500"
                        >
                          Goal: {goals.calories} cal
                        </Text>

                        <HStack
                          height="100%"
                          spacing={2}
                          alignItems="flex-end"
                          justifyContent="space-between"
                        >
                          {weeklyMacros.map((day, idx) => {
                            const date = getWeekDates(
                              getWeekStart(selectedDate),
                            )[idx];
                            const percentage =
                              (day.total_calories / goals.calories) * 100;
                            const height = `${Math.min(percentage, 100)}%`;
                            const isToday =
                              date.toDateString() === new Date().toDateString();

                            return (
                              <VStack
                                key={idx}
                                height="100%"
                                width="13%"
                                spacing={1}
                              >
                                <Box flex="1" width="100%" position="relative">
                                  <Box
                                    position="absolute"
                                    bottom="0"
                                    left="0"
                                    right="0"
                                    height={height}
                                    bg={isToday ? "blue.500" : "blue.300"}
                                    borderTopRadius="md"
                                  />
                                </Box>
                                <Text
                                  fontSize="xs"
                                  fontWeight={isToday ? "bold" : "normal"}
                                >
                                  {date.toLocaleDateString("en-US", {
                                    weekday: "short",
                                  })}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {day.total_calories}
                                </Text>
                              </VStack>
                            );
                          })}
                        </HStack>
                      </Box>
                    </CardBody>
                  </Card>

                  {/* Daily Breakdowns */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Daily Breakdown</Heading>
                    </CardHeader>
                    <CardBody>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Day</Th>
                            <Th isNumeric>Calories</Th>
                            <Th isNumeric>Protein</Th>
                            <Th isNumeric>Carbs</Th>
                            <Th isNumeric>Fat</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {weeklyMacros.map((day, idx) => {
                            const date = getWeekDates(
                              getWeekStart(selectedDate),
                            )[idx];
                            const status = getGoalStatus(
                              day.total_calories,
                              goals.calories,
                            );

                            return (
                              <Tr key={idx}>
                                <Td>
                                  <HStack>
                                    <Text>
                                      {date.toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </Text>
                                    {date.toDateString() ===
                                      new Date().toDateString() && (
                                      <Badge colorScheme="blue">Today</Badge>
                                    )}
                                  </HStack>
                                </Td>
                                <Td isNumeric>{day.total_calories}</Td>
                                <Td isNumeric>{day.total_protein}g</Td>
                                <Td isNumeric>{day.total_carbs}g</Td>
                                <Td isNumeric>{day.total_fat}g</Td>
                                <Td>
                                  <Badge
                                    colorScheme={
                                      status === "Under"
                                        ? "yellow"
                                        : status === "On Target"
                                          ? "green"
                                          : "red"
                                    }
                                  >
                                    {status}
                                  </Badge>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default MacrosPage;
