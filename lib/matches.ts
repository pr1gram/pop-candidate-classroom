export const MATCHES = {
  ylwble: {
    top: "Yellow1",
    bottom: "Blue1",
    topColor: "bg-[#FCD10C]",
    bottomColor: "bg-[#3AADE1]",
    topText: "text-[#087E38]",
    bottomText: "text-[#35548B]",
  },
  rdorge: {
    top: "Red1",
    bottom: "Orange1",
    topColor: "bg-[#EC4A4C]",
    bottomColor: "bg-[#F26A21]",
    topText: "text-[#A70014]",
    bottomText: "text-[#A73203]",
  },
  rdble: {
    top: "Red2",
    bottom: "Blue2",
    topColor: "bg-[#EC4A4C]",
    bottomColor: "bg-[#3AADE1]",
    topText: "text-[#A70014]",
    bottomText: "text-[#35548B]",
  },
  ylworge: {
    top: "Yellow2",
    bottom: "Orange2",
    topColor: "bg-[#FCD10C]",
    bottomColor: "bg-[#F26A21]",
    topText: "text-[#087E38]",
    bottomText: "text-[#A73203]",
  },
} as const

export type MatchSlug = keyof typeof MATCHES