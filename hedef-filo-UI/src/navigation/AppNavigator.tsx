import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  CaseListScreen,
  CreateCaseScreen,
  CaseDetailsScreen,
  CaseStatusTimelineScreen,
  SurveyScreen,
  NotificationsScreen,
  AdminScreen,
  AdminLoginScreen,
} from '../screens';
export type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
  Admin: undefined;
  AdminLogin: undefined;
};
const Stack = createStackNavigator<RootStackParamList>();
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CaseList"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="CaseList" component={CaseListScreen} />
        <Stack.Screen name="CreateCase" component={CreateCaseScreen} />
        <Stack.Screen name="CaseDetails" component={CaseDetailsScreen} />
        <Stack.Screen name="CaseStatusTimeline" component={CaseStatusTimelineScreen} />
              <Stack.Screen name="Survey" component={SurveyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
    </NavigationContainer>
  );
};
