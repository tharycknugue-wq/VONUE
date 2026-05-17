# Vonue Mobile

React Native (Expo SDK 50) + TypeScript + React Navigation + Zustand.

## Comandos

```bash
npm start          # Expo dev server (QR code)
npm run android    # abre no emulador/dispositivo Android
npm run ios         # abre no simulador iOS (macOS)
npm run typecheck  # checagem de tipos
```

## Configuração da API

O app lê `EXPO_PUBLIC_API_URL` (padrão `http://localhost:3000`).

| Cenário | Valor |
|---------|-------|
| Emulador Android | `http://10.0.2.2:3000` |
| Simulador iOS | `http://localhost:3000` |
| Dispositivo físico | `http://<IP-DA-MAQUINA>:3000` |

Defina no `.env` da raiz (carregado pelo Expo) ou ao iniciar:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000 npm start
```

## Fluxo implementado

```
Welcome → Register → Onboarding (20 perguntas) → NucleoReveal → Home
```

- Sessão persistida em `expo-secure-store` (auto-login no próximo abrir).
- Núcleo calculado pela API; cores e tagline por núcleo em `src/theme/colors.ts`.
- Estado global em `src/store/authStore.ts` (Zustand).
