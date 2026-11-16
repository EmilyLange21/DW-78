import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

import { API_URL } from "../../src/config";
import { obtenerComercio } from "../../src/servicios/comercios";
import type { Comercio } from "../../src/tipos";

import SeccionResenas from "@/src/componentes/SeccionResenas";

export default function DetalleComercio() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [cargando, setCargando] = useState(true);

  // Preparar el reproductor de video.
  const player = useVideoPlayer(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        if (id) {
          const respuesta = await obtenerComercio(id);
          setComercio(respuesta);
        }
      } catch (error) {
        console.log("Error al cargar el comercio:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, [id]);

  // Cargar el video del comercio en el reproductor.
  useEffect(() => {
    if (comercio?.videoUrl) {
      const urlVideo = comercio.videoUrl.replace(
        "http://localhost:3000",
        API_URL
      );

      player.replaceAsync(urlVideo).catch((error) => {
        console.log("Error al cargar el video:", error);
      });
    }
  }, [comercio?.videoUrl, player]);

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Cargando comercio...</Text>
      </View>
    );
  }

  if (!comercio) {
    return (
      <View style={estilos.centrado}>
        <Text>No se encontró el comercio.</Text>
      </View>
    );
  }

  const datosComercio = comercio;

  // Abrir WhatsApp
  function abrirWhatsApp() {
    if (datosComercio.whatsapp) {
      const numero = datosComercio.whatsapp.replace(/\D/g, "");
      Linking.openURL("https://wa.me/" + numero);
    }
  }

  // Abrir Instagram
  function abrirInstagram() {
    if (datosComercio.instagram) {
      let url = datosComercio.instagram;

      if (!url.startsWith("http")) {
        url = "https://instagram.com/" + url.replace("@", "");
      }

      Linking.openURL(url);
    }
  }

  // Llamar al comercio
  function llamar() {
    if (datosComercio.telefono) {
      Linking.openURL("tel:" + datosComercio.telefono);
    }
  }

  // Mostrar los horarios de cada día
  function mostrarHorarios() {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    return dias.map((dia, numeroDia) => {
      const horariosDelDia = datosComercio.horarios.filter(
        (horario) => horario.dia === numeroDia
      );

      return (
        <View key={dia} style={estilos.filaHorario}>
          <Text style={estilos.dia}>{dia}</Text>

          <Text style={estilos.horario}>
            {horariosDelDia.length === 0
              ? "Cerrado"
              : horariosDelDia
                  .map((horario) => horario.abre + " - " + horario.cierra)
                  .join(" / ")}
          </Text>
        </View>
      );
    });
  }

  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={estilos.nombre}>{datosComercio.nombre}</Text>

      <Text style={estilos.descripcion}>
        {datosComercio.descripcion}
      </Text>

      {/* Fotografías del comercio */}
      {datosComercio.imagenes && datosComercio.imagenes.length > 0 && (
        <View>
          <Text style={estilos.titulo}>📸 Fotografías</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {datosComercio.imagenes.map((imagen, index) => {
              const urlImagen = imagen.replace(
                "http://localhost:3000",
                API_URL
              );

              return (
                <Image
                  key={index}
                  source={{ uri: urlImagen }}
                  style={estilos.imagenComercio}
                  resizeMode="cover"
                />
              );
            })}
          </ScrollView>
        </View>
      )}

      <Text style={estilos.titulo}>📍 Dirección</Text>
      <Text style={estilos.texto}>{datosComercio.direccion}</Text>

      <Text style={estilos.titulo}>⭐ Puntaje</Text>
      <Text style={estilos.texto}>
        {datosComercio.puntaje} - {datosComercio.cantidadResenas} reseñas
      </Text>

      <Text style={estilos.titulo}>🕐 Horarios</Text>
      {mostrarHorarios()}

      {datosComercio.telefono && (
        <View>
          <Text style={estilos.titulo}>📞 Teléfono</Text>
          <Text style={estilos.enlace} onPress={llamar}>
            {datosComercio.telefono}
          </Text>
        </View>
      )}

      {datosComercio.whatsapp && (
        <View>
          <Text style={estilos.titulo}>💬 WhatsApp</Text>
          <Text style={estilos.enlace} onPress={abrirWhatsApp}>
            Contactar por WhatsApp
          </Text>
        </View>
      )}

      {datosComercio.instagram && (
        <View>
          <Text style={estilos.titulo}>📱 Instagram</Text>
          <Text style={estilos.enlace} onPress={abrirInstagram}>
            {datosComercio.instagram}
          </Text>
        </View>
      )}

      {datosComercio.mediosDePago.length > 0 && (
        <View>
          <Text style={estilos.titulo}>💳 Medios de pago</Text>

          {datosComercio.mediosDePago.map((medio, index) => (
            <Text key={index} style={estilos.texto}>
              • {medio}
            </Text>
          ))}
        </View>
      )}

      {/* Reproductor de video dentro de la aplicación */}
      {datosComercio.videoUrl && (
        <View>
          <Text style={estilos.titulo}>🎥 Video del comercio</Text>

          <VideoView
            player={player}
            style={estilos.video}
            contentFit="contain"
            nativeControls
          />
        </View>
      )}

      <Text style={estilos.titulo}>📝 Reseñas</Text>
      <SeccionResenas comercioId={datosComercio.id} />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },

  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  nombre: {
    fontSize: 27,
    fontWeight: "bold",
    color: "black",
    marginBottom: 10,
  },

  descripcion: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },

  titulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
    marginBottom: 8,
  },

  texto: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },

  imagenComercio: {
    width: 220,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },

  video: {
    width: "100%",
    height: 220,
    backgroundColor: "black",
    borderRadius: 10,
    marginTop: 10,
  },

  filaHorario: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  dia: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },

  horario: {
    fontSize: 15,
    color: "#555",
  },

  enlace: {
    fontSize: 16,
    color: "blue",
    textDecorationLine: "underline",
  },
});




