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
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/desktop/installation' },
            { text: 'Keyboard Shortcuts', link: '/guide/shortcuts' }
          ]
        },
        {
          text: 'The Canvas',
          items: [
            { text: 'Drawing Tools', link: '/features/drawing-tools' },
            { text: 'Frames & Bookmarks', link: '/features/frames' },
            { text: 'Smart Objects', link: '/guide/smart-objects' }
          ]
        }
      ],
      '/desktop/': [
        {
          text: 'Desktop & Recording',
          items: [
            { text: 'Setup Overview', link: '/desktop/' },
            { text: 'Presentation Mode', link: '/desktop/presentation-mode' },
            { text: 'OBS Integration', link: '/desktop/obs-integration' },
            { text: 'Laser & Spotlight', link: '/desktop/laser-spotlight' }
          ]
        }
      ],
      '/features/': [
        {
          text: 'Advanced Features',
          items: [
            { text: 'Magic Animations', link: '/features/animations' },
            { text: 'Code & Math', link: '/features/code-blocks' },
            { text: 'LaTeX Formulas', link: '/features/latex' }
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
