import React from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
} from "@chakra-ui/react";

interface NutritionSummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  calories,
  protein,
  carbs,
  fat,
  calorieGoal = 2000,
  proteinGoal = 120,
  carbsGoal = 200,
  fatGoal = 65,
}) => {
  const calculatePercentage = (value: number, goal: number): number => {
    return Math.min(Math.round((value / goal) * 100), 100);
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Stat>
          <StatLabel>Calories</StatLabel>
          <StatNumber>{calories}</StatNumber>
          <StatHelpText>{`${calculatePercentage(calories, calorieGoal)}% of ${calorieGoal} goal`}</StatHelpText>
          <Progress
            value={calculatePercentage(calories, calorieGoal)}
            colorScheme="green"
            size="sm"
            borderRadius="full"
          />
        </Stat>
        <Stat>
          <StatLabel>Protein</StatLabel>
          <StatNumber>{`${protein}g`}</StatNumber>
          <StatHelpText>{`${calculatePercentage(protein, proteinGoal)}% of ${proteinGoal}g goal`}</StatHelpText>
          <Progress
            value={calculatePercentage(protein, proteinGoal)}
            colorScheme="blue"
            size="sm"
            borderRadius="full"
          />
        </Stat>
        <Stat>
          <StatLabel>Carbs</StatLabel>
          <StatNumber>{`${carbs}g`}</StatNumber>
          <StatHelpText>{`${calculatePercentage(carbs, carbsGoal)}% of ${carbsGoal}g goal`}</StatHelpText>
          <Progress
            value={calculatePercentage(carbs, carbsGoal)}
            colorScheme="orange"
            size="sm"
            borderRadius="full"
          />
        </Stat>
        <Stat>
          <StatLabel>Fat</StatLabel>
          <StatNumber>{`${fat}g`}</StatNumber>
          <StatHelpText>{`${calculatePercentage(fat, fatGoal)}% of ${fatGoal}g goal`}</StatHelpText>
          <Progress
            value={calculatePercentage(fat, fatGoal)}
            colorScheme="red"
            size="sm"
            borderRadius="full"
          />
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default NutritionSummary;
