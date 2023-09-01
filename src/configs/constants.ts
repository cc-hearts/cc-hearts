import {
  ExportIcon,
  VueStarterIcon,
  ImageUploadIcon,
  NestStarterIcon,
  ObjectToDeclareIcon,
  IconFontIcon,
  PasswordIcon,
  SwaggerIcon,
} from '@/icons'

export const prefixCls = 'cc'

export const __DEV__ = import.meta.env.MODE === 'development'
export const GITHUB_URL = 'https://github.com/cc-hearts'

export const subTitle = [
  { title: 'Blog', link: '/blog' },
  { title: 'Projects', link: '/project' },
  { title: 'experiment', link: '/experiment' },
  {
    title: 'tutorial',
    link: 'https://tutorial-five-plum.vercel.app/',
    isToLink: true,
  },
]

export const projects = [
  {
    title: 'gen-index-export',
    link: 'https://github.com/cc-hearts/gen-index-export',
    description: 'Generate code to rename exports',
    icon: ExportIcon,
  },
  {
    title: 'vue3 starter',
    link: 'https://github.com/cc-hearts/vue3-starter.git',
    description: 'A basic template for vue3',
    icon: VueStarterIcon,
  },
  {
    title: 'nest pic',
    link: 'https://github.com/cc-hearts/nest-pic.git',
    description: 'nest implemented the graph bed service',
    icon: ImageUploadIcon,
  },
  {
    title: 'object to declare',
    link: 'https://github.com/cc-hearts/object-to-declare.git',
    description:
      'A library of tools for converting objects into type declarations',
    icon: ObjectToDeclareIcon,
  },
  {
    title: 'icon class generate',
    link: 'https://github.com/cc-hearts/iconfont-class-generate.git',
    description: 'extract the icon name from the iconfont',
    icon: IconFontIcon,
  },
  {
    title: 'nest starter',
    link: 'https://github.com/cc-hearts/nest-starter',
    description:
      'nest templates support the basics of databases, swagger, and more',
    icon: NestStarterIcon,
  },
  {
    title: 'electron-password',
    link: 'https://github.com/cc-hearts/electron-password.git',
    description: 'A password management tool based on electron',
    icon: PasswordIcon,
  },
  {
    title: 'swagger-request',
    link: 'https://github.com/cc-hearts/swagger-request.git',
    description: 'A tool for generating request methods based on swagger',
    icon: SwaggerIcon,
  },
]
