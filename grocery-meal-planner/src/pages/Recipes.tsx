import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Image,
  Badge,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdSearch, MdRestaurantMenu } from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import { getRecipes } from "../api/api";
import { Recipe } from "../types";

const Recipes: React.FC = () => {
  const { recipes, setRecipes } = useAppContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (error) {
        toast({
          title: "Error fetching recipes",
          description: "Could not load recipes. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const placeholderImage = "https://via.placeholder.com/300x200?text=Recipe";

  return (
    <Box>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg">Recipes</Heading>
        <Button
          leftIcon={<MdAdd />}
          colorScheme="green"
          onClick={() => navigate("/recipes/create")}
        >
          Create Recipe
        </Button>
      </HStack>

      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <MdSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
        </Box>
      ) : filteredRecipes.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} overflow="hidden" variant="outline">
              <Image
                src={placeholderImage}
                alt={recipe.name}
                objectFit="cover"
                height="200px"
              />
              <CardHeader pb={0}>
                <Heading size="md">{recipe.name}</Heading>
              </CardHeader>
              <CardBody>
                <HStack spacing={2} mb={2}>
                  <Badge colorScheme="green">
                    {recipe.calories_per_serving} cal
                  </Badge>
                  <Badge colorScheme="blue">
                    {recipe.protein_per_serving}g protein
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Servings: {recipe.servings}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Ingredients: {recipe.ingredients.length}
                </Text>
              </CardBody>
              <CardFooter>
                <Button
                  width="full"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10}>
          <Box fontSize="6xl" mb={4}>
            <MdRestaurantMenu />
          </Box>
          <Heading size="md" mb={2}>
            No Recipes Found
          </Heading>
          {searchQuery ? (
            <Text>
              No recipes match your search. Try a different term or create a new
              recipe.
            </Text>
          ) : (
            <Text>
              You haven't created any recipes yet. Get started by adding your
              first recipe!
            </Text>
          )}
          <Button
            mt={4}
            colorScheme="green"
            leftIcon={<MdAdd />}
            onClick={() => navigate("/recipes/create")}
          >
            Create Recipe
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Recipes;
