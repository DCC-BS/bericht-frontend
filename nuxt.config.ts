import pwaIcons from "./public/icons.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-11-01",
    runtimeConfig: {
        public: {
            apiUrl: process.env.API_URL,
        },
    },
    ui: {
        colorMode: false,
    },
    // Define app head configuration
    app: {
        head: {
            titleTemplate: "%s | Berichtgenerator",
            htmlAttrs: {
                lang: "de",
            },
            meta: [
                { charset: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "apple-mobile-web-app-title",
                    content: "My Test App",
                },
                { name: "application-name", content: "My Test App" },
                { name: "msapplication-config", content: "/browserconfig.xml" },
            ],
        },
    },
    modules: [
        "@nuxt/ui",
        "@nuxtjs/i18n",
        "@dcc-bs/common-ui.bs.js",
        "@dcc-bs/logger.bs.js",
        "@dcc-bs/feedback-control.bs.js",
        "@dcc-bs/event-system.bs.js",
        "@dcc-bs/dependency-injection.bs.js",
        "@vite-pwa/nuxt",
        "@pinia/nuxt",
        "nuxt-viewport",
        "@nuxtjs/leaflet",
    ],
    "feedback-control.bs.js": {
        repo: "Feedback",
        owner: "DCC-BS",
        project: "bericht-frontend",
        githubToken: process.env.GITHUB_TOKEN,
    },
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    // localization
    i18n: {
        locales: [
            {
                code: "en",
                name: "English",
            },
            {
                code: "de",
                name: "Deutsch",
            },
        ],
        bundle: {
            optimizeTranslationDirective: false,
        },
        defaultLocale: "de",
        vueI18n: "./i18n.config.ts",
        lazy: true,
        strategy: "prefix_except_default",
    },
    vite: {
        optimizeDeps: {
            exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
        },
        server: {
            allowedHosts: ["robust-nationally-lacewing.ngrok-free.app"],
            headers: {
                "Cross-Origin-Opener-Policy": "same-origin",
                "Cross-Origin-Embedder-Policy": "require-corp",
            },
        },
        build: {
            minify: "terser",
            terserOptions: {
                keep_fnames: true,
                keep_classnames: true,
            },
        },
    },
    pwa: {
        devOptions: {
            enabled: false,
        },
        registerType: "autoUpdate",
        workbox: {
            globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg}"],
            globIgnores: ["dev-sw-dist/**/*"],
            navigateFallback: "/",
            clientsClaim: true,
            skipWaiting: true,
        },
        client: {
            periodicSyncForUpdates: 60 * 10, // 10 minutes
        },
        manifest: {
            name: "Bericht Generator BS",
            short_name: "Bericht Generator BS",
            description: "Bericht Generator BS",
            theme_color: "#000000",
            background_color: "#000000",
            icons: pwaIcons.icons,
        },
    },
    $development: {
        "logger.bs.js": {
            loglevel: "debug",
        },
        vite: {
            // Enable source maps for development
            build: {
                sourcemap: true,
            },
        },
    },
});
