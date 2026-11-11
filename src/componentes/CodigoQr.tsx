import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type Props = {
    valor: string;
    tamano?: number;
};

export default function CodigoQr ({ valor, tamano = 200 }: Props) {
    return (
        <View style={estilos.marco}>
            <QRCode value={valor} size={tamano} />
        </View>
    );
}

const estilos = StyleSheet.create({
    marco: {padding: 12, backgroundColor: "#fff", borderRadius: 8, alignSelf: "center" },
});