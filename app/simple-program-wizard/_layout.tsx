import { Stack } from 'expo-router';
import { SimpleProgramWizardProvider } from '@/contexts/SimpleProgramWizardContext';

export default function SimpleProgramWizardLayout() {
  return (
    <SimpleProgramWizardProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="training-days" />
        <Stack.Screen name="day-editor" />
        <Stack.Screen name="exercise-selector" />
        <Stack.Screen name="preview" />
      </Stack>
    </SimpleProgramWizardProvider>
  );
}
