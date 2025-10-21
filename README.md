# React Native Login App

Desarrollada con React Native y Expo SDK 54.

## ⚡ Inicio Rápido

### Requisitos
- Node.js 20.19.4 o superior
- Para macOS: `brew install watchman`

### Instalación
```bash
npm install
```

### Ejecutar en Web
```bash
npm run web
```
Se abrirá automáticamente en http://localhost:8081

### Ejecutar en Celular
1. **Instalar Expo Go** en tu celular:
   - [Android - Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iPhone - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Iniciar servidor:**
   ```bash
   npm start
   ```

3. **Escanear código QR:**
   - **Android**: Abre Expo Go y escanea el código QR
   - **iPhone**: Abre la cámara y escanea el código QR

### Ejecutar en Emuladores
```bash
npm run android  # Android Emulator
npm run ios      # iOS Simulator (solo macOS)
```

## 📁 Estructura del Proyecto

```
├── App.js                      # Navegación principal
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js      # Pantalla de inicio de sesión
│   │   └── RegisterScreen.js   # Pantalla de registro
│   ├── components/
│   │   ├── LoginForm.js        # Formulario de login
│   │   └── RegisterForm.js     # Formulario de registro
│   └── theme/
│       └── colors.js           # Paleta de colores
└── app.json                    # Configuración de Expo
```

## 🎨 Características

- **Dos pantallas**: Login y registro con navegación fluida
- **Validación completa**: Formularios validados con Formik + Yup
- **Diseño responsive**: Funciona en web, iOS y Android
- **SDK moderno**: Expo 54 con React 19
- **Navegación**: React Navigation con stack navigator

## 🔧 Personalización

Para conectar con tu backend:
1. Edita `handleLogin` en `LoginScreen.js` 
2. Edita `handleRegister` en `RegisterScreen.js`
3. Ajusta los colores en `src/theme/colors.js`

## 🚀 Build para Producción

```bash
# Generar proyectos nativos (opcional)
npx expo prebuild

# Build para stores
eas build --platform all
```

## ⚠️ Solución de Problemas

**Errores de archivo en macOS:**
```bash
brew install watchman
```

**Limpiar caché:**
```bash
npx expo start --clear
```

**Versión de Node.js:**
```bash
# Actualizar a Node.js 20.19.4+
nvm install 20.19.4 && nvm use 20.19.4
```

## 📦 Tecnologías

- **Expo SDK 54** - Framework de desarrollo
- **React 19** - Librería de UI
- **React Navigation 6** - Navegación entre pantallas  
- **Formik + Yup** - Validación de formularios
- **React Native Web** - Soporte para navegadores
