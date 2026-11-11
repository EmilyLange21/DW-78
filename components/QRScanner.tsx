import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;
    onCodigo: (codigo: string) => void;
};

export default function QRScanner({ visible, onClose, onCodigo }: Props) {
    const [permiso, pedirPermiso] = useCameraPermissions();
    const [leido, setLeido] = useState(false);

    function alLeer({ data }: { data: string }) {
        if (leido) return;
        setLeido(true);
        onCodigo(data);
    }

    return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setLeido(false)}
    >
      <View style={estilos.contenedor}>
        {permiso?.granted ? (
          <>
            <CameraView
              style={estilos.camara}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={alLeer}
            />
            <Text style={estilos.pista}>Apuntá al código QR del cliente</Text>
          </>
        ) : (
          <View style={estilos.centro}>
            <Text style={estilos.mensaje}>
              {permiso
                ? "Necesitamos la cámara para leer el QR del cliente. También podés ingresar el código a mano."
                : "Verificando permiso de cámara..."}
            </Text>
            {permiso && permiso.canAskAgain && (
              <Pressable style={estilos.boton} onPress={pedirPermiso}>
                <Text style={estilos.textoBoton}>Permitir cámara</Text>
              </Pressable>
            )}
            {permiso && !permiso.canAskAgain && (
              <Pressable style={estilos.boton} onPress={() => Linking.openSettings()}>
                <Text style={estilos.textoBoton}>Abrir ajustes</Text>
              </Pressable>
            )}
          </View>
        )}

        <Pressable style={estilos.cerrar} onPress={onClose}>
          <Text style={estilos.textoBoton}>Cerrar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#000" },
  camara: { flex: 1 },
  pista: { position: "absolute", top: 60, alignSelf: "center", color: "#fff", fontSize: 16 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mensaje: { color: "#fff", fontSize: 16, textAlign: "center" },
  boton: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: "#2f95dc" },
  textoBoton: { color: "#fff", fontWeight: "600" },
  cerrar: { position: "absolute", bottom: 40, alignSelf: "center", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, backgroundColor: "#333" },
});