import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Whiteboard Documentation',
  description: 'A powerful infinite-canvas whiteboard for creating educational content',
  base: '/whiteboard/', // GitHub Pages repository URL

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Desktop App', link: '/desktop/' },
      { text: 'Features', link: '/features/' },
      { text: 'Demo', link: 'https://theghoul21.github.io/whiteboard/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Basic Drawing', link: '/guide/basic-drawing' },
            { text: 'Smart Objects', link: '/guide/smart-objects' },
            { text: 'Keyboard Shortcuts', link: '/guide/shortcuts' }
          ]
        }
      ],
      '/desktop/': [
        {
          text: 'Desktop App',
          items: [
            { text: 'Overview', link: '/desktop/' },
            { text: 'Installation', link: '/desktop/installation' },
            { text: 'Presentation Mode', link: '/desktop/presentation-mode' },
            { text: 'OBS Integration', link: '/desktop/obs-integration' },
            { text: 'Laser & Spotlight', link: '/desktop/laser-spotlight' }
          ]
        }
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Overview', link: '/features/' },
            { text: 'Drawing Tools', link: '/features/drawing-tools' },
            { text: 'Animations', link: '/features/animations' },
            { text: 'Code Blocks', link: '/features/code-blocks' },
            { text: 'LaTeX Math', link: '/features/latex' },
            { text: 'Frames & Navigation', link: '/features/frames' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/TheGhoul21/whiteboard' }
    ],

    footer: {
      message: 'Built with ❤️ for educators',
      copyright: 'MIT Licensed'
    },

    search: {
      provider: 'local'
    }
  }
})
