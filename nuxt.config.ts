// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    runtimeConfig: {
        public: {
            apiUrl: process.env.API_URL,
        },
    },
    // Define app head configuration
    app: {
        head: {
            titleTemplate: '%s | Berichtgenerator',
            htmlAttrs: {
                lang: 'de',
            },
            meta: [
                { charset: 'utf-8' },
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1',
                },
                {
                    name: 'apple-mobile-web-app-title',
                    content: 'My Test App',
                },
                { name: 'application-name', content: 'My Test App' },
                { name: 'msapplication-config', content: '/browserconfig.xml' },
            ],
        },
    },
    modules: [
      '@nuxt/ui',
      '@nuxtjs/i18n',
      '@dcc-bs/common-ui.bs.js',
      '@dcc-bs/logger.bs.js',
      '@nuxt/eslint',
      '@vite-pwa/nuxt',
      '@pinia/nuxt',
      'nuxt-viewport',
    ],
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    colorMode: {
        preference: 'light',
    },
    // localization
    i18n: {
        locales: ['en', 'de'],
        defaultLocale: 'de',
        vueI18n: './i18n.config.ts',
        lazy: true,
    },
    // routeRules: {
    //     '**': { proxy: 'https://robust-nationally-lacewing.ngrok-free.app/' },
    // },
    vite: {
        optimizeDeps: {
            exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
        },
        server: {
            allowedHosts: ['robust-nationally-lacewing.ngrok-free.app'],
            headers: {
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Embedder-Policy": "require-corp",
            },
        },
    },
    $development: {
        "logger.bs.js": {
            loglevel: "debug",
        }
    }
});