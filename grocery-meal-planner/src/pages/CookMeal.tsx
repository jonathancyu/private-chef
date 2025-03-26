import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Select,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdChevronLeft, MdWarning, MdCheckCircle } from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import { getRecipes, getInventory, createCookedMeal } from "../api/api";
import { Recipe, InventoryItem, CookedMealCreateRequest } from "../types";

interface RecipeIngredientWithInventory {
  ingredient_id: number;
  name: string;
  required_amount: number;
  available_amount: number;
  unit: string;
  isAvailable: boolean;
}

const CookMeal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    inventory,
    setInventory,
    recipes,
    setRecipes,
    cookedMeals,
    setCookedMeals,
  } = useAppContext();

  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(
    location.state?.recipeId ? Number(location.state.recipeId) : null,
  );
  const [servings, setServings] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ingredientStatus, setIngredientStatus] = useState<
    RecipeIngredientWithInventory[]
  >([]);
  const [canCook, setCanCook] = useState<boolean>(false);
  const [isCooking, setIsCooking] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch recipes and inventory if not already in context
        const [recipesData, inventoryData] = await Promise.all([
          recipes.length > 0 ? recipes : getRecipes(),
          inventory.length > 0 ? inventory : getInventory(),
        ]);

        if (recipes.length === 0) {
          setRecipes(recipesData);
        }

        if (inventory.length === 0) {
          setInventory(inventoryData);
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
  }, []);

  useEffect(() => {
    if (selectedRecipeId && recipes.length > 0 && inventory.length > 0) {
      updateIngredientStatus();
    }
  }, [selectedRecipeId, servings, recipes, inventory]);

  const updateIngredientStatus = () => {
    if (!selectedRecipeId) return;

    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    const ingredientsWithStatus: RecipeIngredientWithInventory[] =
      recipe.ingredients.map((ingredient) => {
        const inventoryItem = inventory.find(
          (item) => item.ingredient_id === ingredient.ingredient_id,
        );
        const requiredAmount = ingredient.amount * (servings / recipe.servings);
        const availableAmount = inventoryItem ? inventoryItem.amount : 0;

        return {
          ingredient_id: ingredient.ingredient_id,
          name:
            ingredient.ingredient?.name ||
            `Ingredient #${ingredient.ingredient_id}`,
          required_amount: requiredAmount,
          available_amount: availableAmount,
          unit: ingredient.ingredient?.unit || "units",
          isAvailable: availableAmount >= requiredAmount,
        };
      });

    setIngredientStatus(ingredientsWithStatus);
    setCanCook(ingredientsWithStatus.every((ing) => ing.isAvailable));
  };

  const handleRecipeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipeId(Number(e.target.value));
  };

  const handleServingsChange = (_: string, value: number) => {
    setServings(value);
  };

  const handleCookMeal = async () => {
    if (!selectedRecipeId || !canCook) {
      toast({
        title: "Cannot cook meal",
        description: "Please ensure you have all required ingredients.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsCooking(true);
    try {
      const cookedMealRequest: CookedMealCreateRequest = {
        recipe_id: selectedRecipeId,
        servings_remaining: servings,
      };

      const result = await createCookedMeal(cookedMealRequest);

      setCookedMeals([...cookedMeals, result]);

      // Update inventory (the backend already did this, but we need to update our state)
      const updatedInventory = await getInventory();
      setInventory(updatedInventory);

      toast({
        title: "Meal cooked!",
        description: "The meal has been cooked and inventory updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Navigate to dashboard or eaten meals
      navigate("/eaten-meals");
    } catch (error) {
      toast({
        title: "Error cooking meal",
        description: "There was an error cooking the meal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCooking(false);
    }
  };

  const getSelectedRecipe = (): Recipe | undefined => {
    if (!selectedRecipeId) return undefined;
    return recipes.find((r) => r.id === selectedRecipeId);
  };

  return (
    <Box>
      <Button
        leftIcon={<MdChevronLeft />}
        variant="ghost"
        mb={4}
        onClick={() => navigate("/recipes")}
      >
        Back to Recipes
      </Button>

      <Heading size="lg" mb={6}>
        Cook a Meal
      </Heading>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md">Select Recipe</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Recipe</FormLabel>
                  <Select
                    placeholder="Select a recipe"
                    value={selectedRecipeId || ""}
                    onChange={handleRecipeChange}
                  >
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Servings to Cook</FormLabel>
                  <NumberInput
                    min={0.5}
                    step={0.5}
                    value={servings}
                    onChange={handleServingsChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>

          {selectedRecipeId && getSelectedRecipe() ? (
            <>
              <Card>
                <CardHeader>
                  <Heading size="md">Recipe Details</Heading>
                </CardHeader>
                <CardBody>
                  <Text fontWeight="medium" fontSize="lg" mb={2}>
                    {getSelectedRecipe()?.name}
                  </Text>

                  <HStack spacing={4} mb={4}>
                    <Badge colorScheme="green" p={2} borderRadius="md">
                      {getSelectedRecipe()?.calories_per_serving}{" "}
                      calories/serving
                    </Badge>
                    <Badge colorScheme="blue" p={2} borderRadius="md">
                      Original: {getSelectedRecipe()?.servings} servings
                    </Badge>
                  </HStack>

                  <Text fontSize="sm" color="gray.600" mb={4}>
                    You are cooking {servings} servings, which is{" "}
                    {servings === getSelectedRecipe()?.servings
                      ? "the original recipe amount"
                      : servings < getSelectedRecipe()!.servings
                        ? "less than the original recipe"
                        : "more than the original recipe"}
                    .
                  </Text>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Ingredient Check</Heading>
                </CardHeader>
                <CardBody>
                  {ingredientStatus.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Ingredient</Th>
                          <Th isNumeric>Required</Th>
                          <Th isNumeric>Available</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {ingredientStatus.map((item, index) => (
                          <Tr key={index}>
                            <Td>{item.name}</Td>
                            <Td isNumeric>
                              {item.required_amount.toFixed(2)} {item.unit}
                            </Td>
                            <Td isNumeric>
                              {item.available_amount.toFixed(2)} {item.unit}
                            </Td>
                            <Td>
                              {item.isAvailable ? (
                                <Badge colorScheme="green">
                                  <HStack spacing={1}>
                                    <MdCheckCircle />
                                    <Text>Available</Text>
                                  </HStack>
                                </Badge>
                              ) : (
                                <Badge colorScheme="red">
                                  <HStack spacing={1}>
                                    <MdWarning />
                                    <Text>Insufficient</Text>
                                  </HStack>
                                </Badge>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text color="gray.500">
                      Select a recipe to see ingredient requirements.
                    </Text>
                  )}
                </CardBody>
              </Card>

              {!canCook && ingredientStatus.length > 0 && (
                <Alert status="warning">
                  <AlertIcon />
                  You don't have enough ingredients to cook this meal. Please
                  adjust the servings or add more ingredients to your inventory.
                </Alert>
              )}

              <Button
                colorScheme="green"
                size="lg"
                isDisabled={!canCook}
                isLoading={isCooking}
                onClick={handleCookMeal}
              >
                Cook Meal
              </Button>
            </>
          ) : (
            <Box textAlign="center" py={6}>
              <Text color="gray.500">
                Please select a recipe to start cooking.
              </Text>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default CookMeal;
