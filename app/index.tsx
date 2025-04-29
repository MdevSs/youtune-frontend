import * as React from 'react';
import { Image, View, ScrollView } from 'react-native';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Separator } from '~/components/ui/separator';
import { Button } from '~/components/ui/button';
import GradientTitle from '~/components/shared/gradient-title';


export default function Screen() {
  const [progress, setProgress] = React.useState(78);
  const [value, setValue] = React.useState("");

  function updateProgressValue() {
    setProgress(Math.floor(Math.random() * 100));
  }
  return (
    <View className="flex justify-center w-full items-center">
      <View className="flex flex-col items-center w-full h-screen p-4">
        <GradientTitle>
          Baixar Música
        </GradientTitle>
        <Text className='text-center'>
          Baixe músicas do YouTube e Youtube Music de forma rápida e fácil!
        </Text>
        <View className="relative w-full mt-5">
          <Input
            placeholder='Cole sua URL aqui!'
            value={value}
            onChangeText={setValue}
            aria-errormessage='inputError'
            className='selected:outline-none '
            aria-labelledby='url'
            onKeyPress={() => { }}
          />
          <Button className='absolute right-0 bg-destructive top-1/2 -translate-y-1/2 w-10' onPress={() => { } /* Mesma função do Input onKeyPress */}><Text>→</Text></Button>
        </View>

      </View>
    </View>
  );
}
