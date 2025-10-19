# React Native Login App

Aplicación base de React Native construida con Expo que muestra una pantalla de inicio de sesión moderna.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (se instala automáticamente al usar `npx`, pero se recomienda tener la aplicación Expo Go en tu dispositivo móvil para probar rápidamente)
- Android Studio con un emulador configurado **o** un dispositivo Android físico con la app Expo Go (opcional pero recomendado)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd codex-example

# Instalar dependencias
npm install
```

## Ejecución

```bash
# Iniciar el servidor de desarrollo de Expo
npm start
```

El comando anterior abrirá Expo Dev Tools en tu navegador. Desde ahí puedes:

- Presionar `a` para lanzar el emulador Android configurado.
- Escanear el código QR con la app Expo Go para correr la app en un dispositivo físico.

## Estructura del proyecto

- `App.js`: punto de entrada de la aplicación.
- `src/screens/LoginScreen.js`: pantalla principal de login.
- `src/components/LoginForm.js`: formulario validado con Formik + Yup.
- `src/theme/colors.js`: constantes de colores reutilizables.
- `app.json`: configuración de Expo.
- `babel.config.js`: configuración de Babel.

## Personalización

- Actualiza el `handleLogin` en `LoginScreen` para conectar con tu backend o lógica de autenticación.
- Ajusta los colores en `src/theme/colors.js` para adaptar la identidad visual.
- Añade navegación u otras pantallas usando React Navigation u otra librería.

## Generar build nativa (opcional)

Si más adelante deseas generar proyectos nativos para Android o iOS, puedes ejecutar:

```bash
npx expo prebuild
```

Este comando crea las carpetas `android/` e `ios/` compatibles con Android Studio y Xcode respectivamente.
