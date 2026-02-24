import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Admin Panel",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          title: "Messages",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: "Users",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          title: "Products",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
