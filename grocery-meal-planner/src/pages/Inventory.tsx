import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
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
  Spinner,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { MdSearch, MdAdd, MdOutlineWarning } from "react-icons/md";
import { useAppContext } from "../context/AppContext";
import { getIngredients, getInventory, addToInventory } from "../api/api";
import {
  Ingredient,
  InventoryItem,
  InventoryItemCreateRequest,
} from "../types";

const Inventory: React.FC = () => {
  const { inventory, setInventory } = useAppContext();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [newItem, setNewItem] = useState<{
    ingredient_id: number;
    amount: number;
    purchase_date: string;
  }>({
    ingredient_id: 0,
    amount: 1,
    purchase_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ingredientsData, inventoryData] = await Promise.all([
          getIngredients(),
          getInventory(),
        ]);
        setIngredients(ingredientsData);
        setInventory(inventoryData);

        // Set default ingredient if available
        if (ingredientsData.length > 0 && newItem.ingredient_id === 0) {
          setNewItem({
            ...newItem,
            ingredient_id: ingredientsData[0].id,
          });
        }
      } catch (error) {
        toast({
          title: "Error loading data",
          description: "Failed to load inventory data.",
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

  const filteredInventory = inventory.filter((item) =>
    item.ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddItem = async () => {
    if (newItem.ingredient_id === 0) {
      toast({
        title: "Error",
        description: "Please select an ingredient",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const inventoryRequest: InventoryItemCreateRequest = {
      ingredient_id: newItem.ingredient_id,
      amount: newItem.amount,
      purchase_date: newItem.purchase_date,
    };

    try {
      const addedItem = await addToInventory(inventoryRequest);

      // Check if item already exists in inventory
      const existingItemIndex = inventory.findIndex(
        (item) => item.ingredient_id === newItem.ingredient_id,
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedInventory = [...inventory];
        updatedInventory[existingItemIndex] = addedItem;
        setInventory(updatedInventory);
      } else {
        // Add new item
        setInventory([...inventory, addedItem]);
      }

      toast({
        title: "Item added",
        description: "Item has been added to inventory.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setNewItem({
        ...newItem,
        amount: 1,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to inventory.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isLowStock = (item: InventoryItem): boolean => {
    return item.amount < 2; // Example threshold, adjust as needed
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="lg">Inventory</Heading>
          <Button leftIcon={<MdAdd />} colorScheme="green" onClick={onOpen}>
            Add to Inventory
          </Button>
        </HStack>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <MdSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>

        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : filteredInventory.length > 0 ? (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Ingredient</Th>
                  <Th>Amount</Th>
                  <Th>Unit</Th>
                  <Th>Purchase Date</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInventory.map((item) => (
                  <Tr key={item.id}>
                    <Td fontWeight="medium">{item.ingredient.name}</Td>
                    <Td>{item.amount.toFixed(2)}</Td>
                    <Td>{item.ingredient.unit}</Td>
                    <Td>{new Date(item.purchase_date).toLocaleDateString()}</Td>
                    <Td>
                      {isLowStock(item) && (
                        <Badge
                          colorScheme="red"
                          display="flex"
                          alignItems="center"
                        >
                          <MdOutlineWarning style={{ marginRight: "4px" }} />
                          Low Stock
                        </Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <Box textAlign="center" py={10}>
            <Text mb={4}>No inventory items found.</Text>
            <Button colorScheme="green" leftIcon={<MdAdd />} onClick={onOpen}>
              Add Your First Item
            </Button>
          </Box>
        )}
      </VStack>

      {/* Add Inventory Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add to Inventory</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Ingredient</FormLabel>
                <Select
                  value={newItem.ingredient_id}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      ingredient_id: Number(e.target.value),
                    })
                  }
                >
                  <option value={0} disabled>
                    Select an ingredient
                  </option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <NumberInput
                  min={0.1}
                  step={0.1}
                  value={newItem.amount}
                  onChange={(_, value) =>
                    setNewItem({ ...newItem, amount: value })
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
                <FormLabel>Purchase Date</FormLabel>
                <Input
                  type="date"
                  value={newItem.purchase_date}
                  onChange={(e) =>
                    setNewItem({ ...newItem, purchase_date: e.target.value })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={handleAddItem}>
              Add to Inventory
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Inventory;
