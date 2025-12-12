import { Stack } from 'expo-router';
import { ProgramWizardProvider } from '@/contexts/ProgramWizardContext';

export default function WizardLayout() {
  return (
    <ProgramWizardProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="microcycles" />
        <Stack.Screen name="training-days" />
        <Stack.Screen name="exercise-selector" />
        <Stack.Screen name="preview" />
      </Stack>
    </ProgramWizardProvider>
  );
}
