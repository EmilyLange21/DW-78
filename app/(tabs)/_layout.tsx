import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { ColorValue } from "react-native";

type NombreIcono = ComponentProps<typeof Ionicons>["name"];

function icono(nombre: NombreIcono) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={nombre} color={color} size={size} />
  );
}

export default function LayoutDePestanas() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: "Buscar", tabBarIcon: icono("search-outline") }} />
      <Tabs.Screen name="promos" options={{ title: "Promos", tabBarIcon: icono("pricetag-outline") }} />
      <Tabs.Screen name="mapa" options={{ title: "Mapa", tabBarIcon: icono("map-outline") }} />
      <Tabs.Screen name="resenas" options={{ title: "Reseñas", tabBarIcon: icono("star-outline") }} />
      <Tabs.Screen name="yo" options={{ title: "Yo", tabBarIcon: icono("person-outline") }} />
    </Tabs>
  );
}
