import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  listarComercios,
  listarRubros,
} from "../../src/servicios/comercios";

import type { Comercio, Horario, Rubro } from "../../src/tipos";

// Comprueba si un comercio está abierto según sus horarios.
function estaAbierto(horarios: Horario[]) {
  const ahora = new Date();

  const diaActual = ahora.getDay();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  return horarios.some((horario) => {
    const [horaApertura, minutoApertura] = horario.abre
      .split(":")
      .map(Number);

    const [horaCierre, minutoCierre] = horario.cierra
      .split(":")
      .map(Number);

    const apertura = horaApertura * 60 + minutoApertura;
    const cierre = horaCierre * 60 + minutoCierre;

    // Horarios que comienzan y terminan el mismo día.
    if (horario.dia === diaActual && cierre > apertura) {
      return horaActual >= apertura && horaActual < cierre;
    }

    // Horarios que terminan después de medianoche.
    if (horario.dia === diaActual && cierre < apertura) {
      return horaActual >= apertura;
    }

    // Comprueba si el horario del día anterior continúa abierto.
    const diaAnterior = (diaActual + 6) % 7;

    if (
      horario.dia === diaAnterior &&
      cierre < apertura &&
      horaActual < cierre
    ) {
      return true;
    }

    return false;
  });
}

export default function Pantalla() {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [rubroSeleccionado, setRubroSeleccionado] = useState("");
  const [soloAbiertos, setSoloAbiertos] = useState(false);

  // Carga los comercios y los rubros desde la API.
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [respuestaComercios, respuestaRubros] = await Promise.all([
          listarComercios({
            pagina: 1,
            porPagina: 1000,
          }),
          listarRubros(),
        ]);

        setComercios(respuestaComercios.datos);
        setRubros(respuestaRubros);
      } catch (e) {
        console.error("Error al cargar los datos:", e);
        setError("No se pudieron cargar los comercios.");
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  // Aplica la busqueda y los filtros seleccionados.
  const comerciosFiltrados = comercios.filter((comercio) => {
    const coincideNombre = comercio.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase());

    const coincideRubro =
      rubroSeleccionado === "" ||
      comercio.rubroId === rubroSeleccionado;

    const coincideAbierto =
      !soloAbiertos || estaAbierto(comercio.horarios);

    return coincideNombre && coincideRubro && coincideAbierto;
  });

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" />
        <Text style={estilos.texto}>Cargando comercios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={estilos.centrado}>
        <Text style={estilos.texto}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Buscar comercios</Text>

      <TextInput
        style={estilos.buscador}
        placeholder="¿Qué comercio estás buscando?"
        placeholderTextColor="#888888"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <Text style={estilos.subtitulo}>Categorías</Text>

      <Pressable
        style={[
          estilos.botonAbierto,
          soloAbiertos && estilos.botonAbiertoActivo,
        ]}
        onPress={() => setSoloAbiertos(!soloAbiertos)}
      >
        <Text
          style={[
            estilos.textoBotonAbierto,
            soloAbiertos && estilos.textoBotonAbiertoActivo,
          ]}
        >
          {soloAbiertos ? "✓ Abierto ahora" : "Abierto ahora"}
        </Text>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={estilos.listaRubros}
      >
        <Pressable
          style={[
            estilos.botonRubro,
            rubroSeleccionado === "" && estilos.rubroActivo,
          ]}
          onPress={() => setRubroSeleccionado("")}
        >
          <Text
            style={[
              estilos.textoRubro,
              rubroSeleccionado === "" && estilos.textoRubroActivo,
            ]}
          >
            Todos
          </Text>
        </Pressable>

        {rubros.map((rubro) => (
          <Pressable
            key={rubro.id}
            style={[
              estilos.botonRubro,
              rubroSeleccionado === rubro.id && estilos.rubroActivo,
            ]}
            onPress={() => setRubroSeleccionado(rubro.id)}
          >
            <Text
              style={[
                estilos.textoRubro,
                rubroSeleccionado === rubro.id &&
                  estilos.textoRubroActivo,
              ]}
            >
              {rubro.nombre}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={comerciosFiltrados}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={estilos.texto}>
            No se encontraron comercios.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={estilos.tarjeta}>
            <Text style={estilos.nombre}>{item.nombre}</Text>
            <Text
  style={{
    color: estaAbierto(item.horarios) ? "#218838" : "#cc3333",
    fontWeight: "bold",
    marginBottom: 5,
  }}
>
  {estaAbierto(item.horarios) ? "ABIERTO" : "CERRADO"}
</Text>

            <Text style={estilos.descripcion}>
              {item.descripcion}
            </Text>

            <Text style={estilos.descripcion}>
              Dirección: {item.direccion}
            </Text>

            <Text style={estilos.descripcion}>
              Puntaje: {item.puntaje} ({item.cantidadResenas} reseñas)
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#ffffff",
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
  },
  buscador: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  botonAbierto: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#eeeeee",
    marginBottom: 15,
  },
  botonAbiertoActivo: {
    backgroundColor: "#218838",
  },
  textoBotonAbierto: {
    color: "#333333",
    fontWeight: "500",
  },
  textoBotonAbiertoActivo: {
    color: "#ffffff",
  },
  listaRubros: {
    minHeight: 50,
    maxHeight: 55,
    marginBottom: 20,
    flexGrow: 0,
  },
  botonRubro: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#eeeeee",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rubroActivo: {
    backgroundColor: "#333333",
  },
  textoRubro: {
    color: "#333333",
    fontWeight: "500",
  },
  textoRubroActivo: {
    color: "#ffffff",
  },
  texto: {
    fontSize: 16,
    color: "#000000",
  },
  tarjeta: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000000",
  },
  descripcion: {
    fontSize: 14,
    marginBottom: 3,
    color: "#000000",
  },
});
