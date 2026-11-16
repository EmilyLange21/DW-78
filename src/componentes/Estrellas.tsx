import Ionicons from "@react-native-vector-icons/ionicons";
import { Pressable, View } from "react-native";

interface Props{
    valor: number
    onCambiar?:(nuevo:1 | 2 | 3 | 4 | 5) => void
    tamano?:number
}

export default function Estrellas({valor, onCambiar, tamano=20}:Props){
    return(
        <View style={{flexDirection: "row"}}>
            {([1,2,3,4,5] as const).map((n)=> {
                const estrella=(
                    <Ionicons
                        name={n<=Math.round(valor)?"star":"star-outline"}
                        size={tamano}
                        color="f59e0b"
                    />
                );

                if(!onCambiar) return <View key={n}>{estrella}</View>

                return(
                    <Pressable
                        key={n}
                        onPress={()=>onCambiar(n)}
                        accessibilityLabel={`${n} estrellas`}
                        >
                        {estrella}
                    </Pressable>
                )
            })}
        </View>
    )
}