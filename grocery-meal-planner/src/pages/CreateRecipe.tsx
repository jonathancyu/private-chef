import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  HStack,
  Divider,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MdDelete, MdAdd, MdArrowBack } from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import { getIngredients, createRecipe } from "../api/api";
import { Ingredient, RecipeCreateRequest, Recipe } from "../types";

const CreateRecipe: React.FC = () => {
  const { setRecipes } = useAppContext();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<{
    name: string;
    servings: number;
    calories_per_serving: number;
    protein_per_serving: number;
    carbs_per_serving: number;
    fat_per_serving: number;
    instructions: string;
    recipeIngredients: Array<{ ingredient_id: number; amount: number }>;
  }>({
    name: "",
    servings: 1,
    calories_per_serving: 0,
    protein_per_serving: 0,
    carbs_per_serving: 0,
    fat_per_serving: 0,
    instructions: "",
    recipeIngredients: [],
  });

  useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoading(true);
      try {
        const data = await getIngredients();
        setIngredients(data);
      } catch (error) {
        toast({
          title: "Error fetching ingredients",
          description: "Could not load ingredients. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value,
    });
  };

  const handleNumberInputChange = (name: string, value: number) => {
    setRecipe({
      ...recipe,
      [name]: value,
    });
  };

  const addIngredient = () => {
    if (ingredients.length > 0) {
      setRecipe({
        ...recipe,
        recipeIngredients: [
          ...recipe.recipeIngredients,
          { ingredient_id: ingredients[0].id, amount: 1 },
        ],
      });
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...recipe.recipeIngredients];
    updatedIngredients.splice(index, 1);
    setRecipe({
      ...recipe,
      recipeIngredients: updatedIngredients,
    });
  };

  const updateIngredient = (
    index: number,
    field: "ingredient_id" | "amount",
    value: number,
  ) => {
    const updatedIngredients = [...recipe.recipeIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value,
    };
    setRecipe({
      ...recipe,
      recipeIngredients: updatedIngredients,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipe.name) {
      toast({
        title: "Error",
        description: "Recipe name is required",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (recipe.recipeIngredients.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one ingredient",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const recipeData: RecipeCreateRequest = {
      name: recipe.name,
      servings: recipe.servings,
      calories_per_serving: recipe.calories_per_serving,
      protein_per_serving: recipe.protein_per_serving,
      carbs_per_serving: recipe.carbs_per_serving,
      fat_per_serving: recipe.fat_per_serving,
      instructions: recipe.instructions,
      ingredients: recipe.recipeIngredients,
    };

    setIsSubmitting(true);
    try {
      const createdRecipe = await createRecipe(recipeData);

      setRecipes((prevRecipes) => [...prevRecipes, createdRecipe]);

      toast({
        title: "Recipe created",
        description: `${createdRecipe.name} has been created successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/recipes");
    } catch (error) {
      toast({
        title: "Error creating recipe",
        description: "Could not create recipe. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIngredientById = (id: number): Ingredient | undefined => {
    return ingredients.find((ingredient) => ingredient.id === id);
  };

  return (
    <Box>
      <Button
        leftIcon={<MdArrowBack />}
        variant="ghost"
        mb={4}
        onClick={() => navigate("/recipes")}
      >
        Back to Recipes
      </Button>

      <Heading size="lg" mb={6}>
        Create New Recipe
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Recipe Name</FormLabel>
            <Input
              name="name"
              value={recipe.name}
              onChange={handleInputChange}
              placeholder="Enter recipe name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Servings</FormLabel>
            <NumberInput
              min={1}
              value={recipe.servings}
              onChange={(_, value) =>
                handleNumberInputChange("servings", value)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Heading size="md" mt={2}>
            Nutrition (per serving)
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <FormControl>
              <FormLabel>Calories</FormLabel>
              <NumberInput
                min={0}
                value={recipe.calories_per_serving}
                onChange={(_, value) =>
                  handleNumberInputChange("calories_per_serving", value)
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
              <FormLabel>Protein (g)</FormLabel>
              <NumberInput
                min={0}
                step={0.1}
                value={recipe.protein_per_serving}
                onChange={(_, value) =>
                  handleNumberInputChange("protein_per_serving", value)
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
              <FormLabel>Carbs (g)</FormLabel>
              <NumberInput
                min={0}
                step={0.1}
                value={recipe.carbs_per_serving}
                onChange={(_, value) =>
                  handleNumberInputChange("carbs_per_serving", value)
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
              <FormLabel>Fat (g)</FormLabel>
              <NumberInput
                min={0}
                step={0.1}
                value={recipe.fat_per_serving}
                onChange={(_, value) =>
                  handleNumberInputChange("fat_per_serving", value)
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

          <Divider my={4} />

          <Box>
            <HStack justifyContent="space-between" mb={4}>
              <Heading size="md">Ingredients</Heading>
              <Button
                leftIcon={<MdAdd />}
                size="sm"
                colorScheme="blue"
                onClick={addIngredient}
                isDisabled={ingredients.length === 0}
              >
                Add Ingredient
              </Button>
            </HStack>

            {recipe.recipeIngredients.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Ingredient</Th>
                    <Th>Amount</Th>
                    <Th>Unit</Th>
                    <Th width="50px"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recipe.recipeIngredients.map((item, index) => {
                    const ingredient = getIngredientById(item.ingredient_id);
                    return (
                      <Tr key={index}>
                        <Td>
                          <Select
                            value={item.ingredient_id}
                            onChange={(e) =>
                              updateIngredient(
                                index,
                                "ingredient_id",
                                Number(e.target.value),
                              )
                            }
                          >
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <NumberInput
                            min={0}
                            step={0.1}
                            value={item.amount}
                            onChange={(_, value) =>
                              updateIngredient(index, "amount", value)
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Td>
                        <Td>{ingredient?.unit || "N/A"}</Td>
                        <Td>
                          <IconButton
                            aria-label="Remove ingredient"
                            icon={<MdDelete />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeIngredient(index)}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <Text color="gray.500" textAlign="center" py={4}>
                No ingredients added yet. Click "Add Ingredient" to start.
              </Text>
            )}
          </Box>

          <Divider my={4} />

          <FormControl>
            <FormLabel>Instructions</FormLabel>
            <Textarea
              name="instructions"
              value={recipe.instructions}
              onChange={handleInputChange}
              placeholder="Enter step-by-step instructions"
              rows={8}
            />
          </FormControl>

          <HStack justifyContent="flex-end" spacing={4} pt={4}>
            <Button variant="outline" onClick={() => navigate("/recipes")}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="green" isLoading={isSubmitting}>
              Create Recipe
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateRecipe;
