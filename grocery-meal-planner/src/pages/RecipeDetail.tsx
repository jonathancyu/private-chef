import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Button,
  List,
  ListItem,
  ListIcon,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdChevronLeft,
  MdCheckCircle,
  MdLocalDining,
  MdTimer,
} from "react-icons/md";
import { getRecipes } from "../api/api";
import { Recipe } from "../types";

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const recipes = await getRecipes();
        const foundRecipe = recipes.find((r) => r.id === Number(id));
        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          setError("Recipe not found");
        }
      } catch (error) {
        setError("Failed to load recipe details");
        toast({
          title: "Error",
          description: "Could not load recipe details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error || !recipe) {
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
        <Alert status="error">
          <AlertIcon />
          {error || "Recipe not found"}
        </Alert>
      </Box>
    );
  }

  // Split instructions into steps
  const instructionSteps = recipe.instructions
    .split(/\r?\n/)
    .filter((step) => step.trim() !== "")
    .map((step) => step.trim());

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

      <VStack spacing={6} align="stretch">
        <Heading size="lg">{recipe.name}</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box>
            <Box
              bgColor="gray.100"
              borderRadius="md"
              height="300px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={4}
            >
              <MdLocalDining size={100} color="#CBD5E0" />
            </Box>

            <HStack spacing={4} mb={4}>
              <Badge colorScheme="green" p={2} borderRadius="md">
                {recipe.calories_per_serving} calories
              </Badge>
              <Badge colorScheme="blue" p={2} borderRadius="md">
                {recipe.servings} servings
              </Badge>
              <Badge colorScheme="purple" p={2} borderRadius="md">
                <HStack>
                  <MdTimer />
                  <Text>30 mins</Text>
                </HStack>
              </Badge>
            </HStack>

            <Box mb={6}>
              <Heading size="md" mb={3}>
                Nutrition (per serving)
              </Heading>
              <SimpleGrid columns={3} spacing={4}>
                <Box p={3} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold">{recipe.protein_per_serving}g</Text>
                  <Text fontSize="sm">Protein</Text>
                </Box>
                <Box p={3} bg="orange.50" borderRadius="md">
                  <Text fontWeight="bold">{recipe.carbs_per_serving}g</Text>
                  <Text fontSize="sm">Carbs</Text>
                </Box>
                <Box p={3} bg="red.50" borderRadius="md">
                  <Text fontWeight="bold">{recipe.fat_per_serving}g</Text>
                  <Text fontSize="sm">Fat</Text>
                </Box>
              </SimpleGrid>
            </Box>
          </Box>

          <Box>
            <Heading size="md" mb={3}>
              Ingredients
            </Heading>
            <List spacing={2} mb={6}>
              {recipe.ingredients.map((item, index) => (
                <ListItem key={index} display="flex" alignItems="center">
                  <ListIcon as={MdCheckCircle} color="green.500" />
                  <Text>
                    {item.amount} {item.ingredient?.unit || "units"}{" "}
                    {item.ingredient?.name ||
                      `Ingredient #${item.ingredient_id}`}
                  </Text>
                </ListItem>
              ))}
            </List>

            <Divider my={4} />

            <Heading size="md" mb={3}>
              Instructions
            </Heading>
            <List spacing={3} styleType="decimal" pl={5}>
              {instructionSteps.map((step, index) => (
                <ListItem key={index}>
                  <Text>{step}</Text>
                </ListItem>
              ))}
              {instructionSteps.length === 0 && (
                <Text color="gray.500">No instructions provided.</Text>
              )}
            </List>
          </Box>
        </SimpleGrid>

        <HStack spacing={4} mt={6}>
          <Button
            colorScheme="orange"
            size="lg"
            onClick={() =>
              navigate("/cook-meal", { state: { recipeId: recipe.id } })
            }
          >
            Cook This Recipe
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              navigate("/meal-planning", { state: { addRecipe: recipe.id } })
            }
          >
            Add to Meal Plan
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default RecipeDetail;
