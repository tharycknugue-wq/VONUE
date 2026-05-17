import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '../../components/Button';
import { palette } from '../../theme/colors';
import { api, ApiError, type ProductCategory } from '../../services/api';
import type { ScreenProps } from '../../navigation/types';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'CLOTHING', label: 'Roupa' },
  { value: 'ACCESSORY', label: 'Acessório' },
  { value: 'EQUIPMENT', label: 'Equipamento' },
  { value: 'TICKET', label: 'Ingresso' },
  { value: 'OTHER', label: 'Outro' },
];

export function SellProductScreen({ navigation }: ScreenProps<'SellProduct'>) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<ProductCategory>('CLOTHING');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const priceN = Number(price.replace(',', '.'));
    const stockN = Number(stock);
    if (!name.trim() || Number.isNaN(priceN) || Number.isNaN(stockN)) {
      Alert.alert('Atenção', 'Preencha nome, preço e estoque válidos.');
      return;
    }
    setLoading(true);
    try {
      await api.createStoreProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        price: priceN,
        stock: stockN,
        category,
      });
      Alert.alert('Anúncio criado', `${name} está à venda.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Falha ao anunciar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Nome" value={name} onChangeText={setName} />
        <Field
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Field
          label="Preço (R$)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />
        <Field
          label="Estoque"
          value={stock}
          onChangeText={setStock}
          keyboardType="number-pad"
          placeholder="0"
        />

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.value}
              onPress={() => setCategory(c.value)}
              style={[styles.chip, category === c.value && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === c.value && styles.chipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          label="Anunciar"
          onPress={submit}
          loading={loading}
          style={styles.submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={palette.textMuted}
        style={[styles.input, props.multiline && styles.inputMulti]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 24, paddingBottom: 48 },
  field: { marginBottom: 14 },
  label: { color: palette.textMuted, fontSize: 13, marginBottom: 8, marginTop: 6 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 14,
    color: palette.text,
    fontSize: 16,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top', paddingTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipActive: { borderColor: palette.primary, backgroundColor: palette.surfaceAlt },
  chipText: { color: palette.textMuted, fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: palette.primary },
  submit: { marginTop: 28 },
});
