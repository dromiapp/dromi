import Link from "next/link"
import GitHubIcon from "../icons/github"
import DiscordIcon from "../icons/discord"

const navigation = [
  {
    name: 'Social',
    links: [
      { name: 'GitHub', href: 'https://github.com/dromiapp', icon: <GitHubIcon /> },
      { name: 'Discord', href: 'https://discord.gg/krgsVNEQRJ', icon: <DiscordIcon /> },
    ]
  },
  {
    name: 'Company',
    links: [
      { name: 'About', href: '/about', icon: undefined },
    ]
  },
  {
    name: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy', icon: undefined },
      { name: 'Terms & Conditions', href: '/terms', icon: undefined },
    ]
  },
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 relative">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8 grid-cols-2 md:grid flex flex-col gap-4">
        <div className="flex items-start select-none">
          <div className="flex gap-2 items-center">
            <img src="/logo.svg" alt="dromi" className="h-4 w-4" />
            <span className="text-xl font-bold">dromi</span>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="grid grid-cols-3 gap-8">
            {navigation.map((item) => {
              return (
                <div key={item.name}>
                  <h2 className="mb-4 text-sm font-bold">{item.name}</h2>
                  <ul className="font-light text-sm text-secondary-foreground/80">
                    {item.links.map((link) => {
                      return (
                        <li key={link.name} className="mb-4 flex items-center gap-1 hover:text-secondary-foreground">
                          {link.icon}
                          <Link href={link.href}>
                            {link.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </footer >
  )
}
