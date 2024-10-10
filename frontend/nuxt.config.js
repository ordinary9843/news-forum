import requireDir from 'require-dir'
export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: '新聞民意廣場',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '本專案旨在蒐集大量新聞資料，並為使用者提供特定選項以便進行投票。透過這個平台，我們希望能夠促進公眾對當前事件的參與和互動，收集社會對各種新聞事件的意見和情感反應。用戶可以針對不同的新聞事件進行投票，並選擇適合的選項，反映他們的觀點和態度。' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/news.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['ant-design-vue/dist/antd.css'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['@/plugins/antd-ui', '@/plugins/lottie-vue-player.client.js'],

  loading: { color: '#1890ff', height: '3px' },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '@nuxtjs/style-resources',
    [
      'nuxt-i18n',
      {
        strategy: 'no_prefix',
        locales: [
          { code: 'en', iso: 'english' },
          { code: 'zh', iso: 'zh-TW' }
        ],
        defaultLocale: 'en',
        vueI18n: {
          fallbackLocale: 'en',
          messages: {
            zh: requireDir('./assets/i18n/zh-TW', { recurse: true }),
            en: requireDir('./assets/i18n/english', { recurse: true })
          }
        }
      }
    ]
  ],

  styleResources: {
    scss: ['@/assets/css/variables.scss']
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
  },

  proxy: {
    // '/DEV': {
    //   target: '', // 代理地址
    //   ws: true, // 代理websockets
    //   secure: true,
    //   changeOrigin: true // 虛擬的站點需要更管origin，是否跨域
    //   // pathRewrite: {
    //   //   '^/api': '/',
    //   // },
    // }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
