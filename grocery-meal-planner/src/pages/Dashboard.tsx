import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  HStack,
  Badge,
  Button,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  MdRestaurantMenu,
  MdCalendarToday,
  MdKitchen,
  MdAssessment,
} from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import DateSelector from "../components/DateSelector";
import NutritionSummary from "../components/NutritionSummary";
import { getPlannedMeals, getDailyMacros } from "../api/api";
import { PlannedMeal, MacrosSummary, MealType } from "../types";

const Dashboard: React.FC = () => {
  const { selectedDate, recipes, inventory } = useAppContext();
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [macros, setMacros] = useState<MacrosSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Format date as YYYY-MM-DD for API
      const formattedDate = selectedDate.toISOString().split("T")[0];

      // Fetch planned meals for today
      const mealsData = await getPlannedMeals(formattedDate, formattedDate);
      setPlannedMeals(mealsData);

      // Fetch macros for today
      const macrosData = await getDailyMacros(formattedDate);
      setMacros(macrosData);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Could not load dashboard data. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

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

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>
            Dashboard
          </Heading>
          <DateSelector />
        </Box>

        {macros && (
          <NutritionSummary
            calories={macros.total_calories}
            protein={macros.total_protein}
            carbs={macros.total_carbs}
            fat={macros.total_fat}
          />
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardHeader pb={2}>
              <HStack>
                <Box color="green.500">
                  <MdRestaurantMenu size={24} />
                </Box>
                <Heading size="md">Recipes</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Total Recipes</StatLabel>
                <StatNumber>{recipes.length}</StatNumber>
              </Stat>
              <Button
                colorScheme="green"
                size="sm"
                mt={4}
                onClick={() => navigate("/recipes")}
              >
                Manage Recipes
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={2}>
              <HStack>
                <Box color="blue.500">
                  <MdCalendarToday size={24} />
                </Box>
                <Heading size="md">Planned Meals</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Today's Planned Meals</StatLabel>
                <StatNumber>{plannedMeals.length}</StatNumber>
              </Stat>
              <Button
                colorScheme="blue"
                size="sm"
                mt={4}
                onClick={() => navigate("/meal-planning")}
              >
                Plan Meals
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={2}>
              <HStack>
                <Box color="orange.500">
                  <MdKitchen size={24} />
                </Box>
                <Heading size="md">Inventory</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Ingredients</StatLabel>
                <StatNumber>{inventory.length}</StatNumber>
              </Stat>
              <Button
                colorScheme="orange"
                size="sm"
                mt={4}
                onClick={() => navigate("/inventory")}
              >
                Manage Inventory
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader pb={2}>
              <HStack>
                <Box color="purple.500">
                  <MdAssessment size={24} />
                </Box>
                <Heading size="md">Nutrition</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stat>
                <StatLabel>Today's Calories</StatLabel>
                <StatNumber>{macros?.total_calories || 0}</StatNumber>
              </Stat>
              <Button
                colorScheme="purple"
                size="sm"
                mt={4}
                onClick={() => navigate("/macros")}
              >
                View Details
              </Button>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card>
          <CardHeader>
            <Heading size="md">Today's Meal Plan</Heading>
          </CardHeader>
          <CardBody>
            {plannedMeals.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {Object.values(MealType).map((mealType) => {
                  const meals = plannedMeals.filter(
                    (meal) => meal.meal_type === mealType,
                  );
                  if (meals.length === 0) return null;

                  return (
                    <Box key={mealType}>
                      <Text fontWeight="bold" mb={2}>
                        {getMealTypeLabel(mealType)}
                      </Text>
                      {meals.map((meal) => (
                        <HStack
                          key={meal.id}
                          spacing={4}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <Badge
                            colorScheme={meal.recipe_id ? "green" : "blue"}
                          >
                            {meal.recipe_id ? "Recipe" : "Snack"}
                          </Badge>
                          <Text flex="1">
                            {meal.recipe?.name || meal.snack?.name || "Unknown"}
                          </Text>
                          <Text color="gray.500">
                            {meal.servings} serving(s)
                          </Text>
                        </HStack>
                      ))}
                    </Box>
                  );
                })}
              </VStack>
            ) : (
              <Text color="gray.500">
                No meals planned for today. Go to Meal Planning to add some!
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Dashboard;
