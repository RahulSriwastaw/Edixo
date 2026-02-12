import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { LayoutDashboard, Users, BookOpen, Presentation } from 'lucide-react-native';

// Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import TeacherListScreen from '../screens/admin/teachers/TeacherListScreen';
import AddTeacherScreen from '../screens/admin/teachers/AddTeacherScreen';
import CourseListScreen from '../screens/admin/courses/CourseListScreen';
import CreateCourseScreen from '../screens/admin/courses/CreateCourseScreen';
import SetsListScreen from '../screens/admin/sets/SetsListScreen';
import CreateSetScreen from '../screens/admin/sets/CreateSetScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Admin Tab Navigator
function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#FF5A1F',
                tabBarInactiveTintColor: '#64748b',
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Teachers"
                component={TeacherListScreen}
                options={{
                    tabBarLabel: 'Teachers',
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Courses"
                component={CourseListScreen}
                options={{
                    tabBarLabel: 'Courses',
                    tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Sets"
                component={SetsListScreen}
                options={{
                    tabBarLabel: 'Whiteboard',
                    tabBarIcon: ({ color, size }) => <Presentation size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

// Admin Stack Navigator (for details screens, forms etc)
export default function AdminNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="AddTeacher" component={AddTeacherScreen} />
            <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
            <Stack.Screen name="CreateSet" component={CreateSetScreen} />
        </Stack.Navigator>
    );
}

