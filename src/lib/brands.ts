export function getBrandOptions(department?: string | null, category?: string | null): { value: string; label: string }[] {
  let brands: string[] = [];

  if (department === "men") {
    switch (category) {
      case "socks":
        brands = ["کادنو", "بوگارو", "دومینو", "نایک", "ملودی", "پا ارا", "نایکی", "فندی", "پولو", "پییر گاردین", "بوس"];
        break;
      case "underwear":
        brands = ["کلوین", "کولسی", "براک", "استاش", "وال", "کلونت", "رجال", "خارجی"];
        break;
      case "undershirts":
        brands = ["براک", "استاش", "انیت", "وال", "کلوین", "کلونت", "پلیس", "رجال"];
        break;
      case "pants":
        brands = ["نایکی", "ادیداس", "نفرپوش", "پندار", "حریرتن پوش", "پوما", "چهارخونه", "پادینا", "هیراد", "خارجی"];
        break;
      case "shorts":
        brands = ["نایکی", "ادیداس", "نفرپوش", "پندار", "حریرتن پوش", "چهارخونه", "پوما", "پادینا", "هیراد", "خارجی", "جی جی", "رویال"];
        break;
      case "t-shirts":
        brands = ["نایکی", "ادیداس", "نفرپوش", "پندار", "استاش", "براک", "هیراد", "پوما", "خارجی"];
        break;
      case "tank-tops":
        brands = ["نایکی", "ادیداس", "نفرپوش", "پندار", "استاش", "براک", "هیراد", "پوما", "خارجی"];
        break;
      case "swimwear":
        brands = ["اف ام", "ایرانی"];
        break;
      case "sets":
        brands = ["هیراد", "نفر پوش", "پندار", "نایکی", "ادیداس", "پوما", "خارجی", "استاش", "براک"];
        break;
    }
  } else if (department === "women") {
    switch (category) {
      case "socks":
        brands = ["کادنو", "کامفی", "ملودی", "فمیلی ساکس", "لمون", "ریبال", "نایکی", "خارجی"];
        break;
      case "underwear":
        brands = ["میسپل", "ساویس", "پولین", "کلوین", "خارجی"];
        break;
      case "undershirts":
        brands = ["براک", "کلونت", "میسپل"];
        break;
      case "pants":
      case "shorts":
        brands = ["دوریس", "دراس", "لیان", "پوشل", "نایک", "ادیداس", "پوما", "میسپل", "پادینا"];
        break;
      case "t-shirts":
      case "tank-tops":
        brands = ["نایکی", "ادیداس", "دراس", "استاش", "براک", "هیراد", "پوما", "میسپل", "خارجی"];
        break;
      case "sets":
        brands = ["هیراد", "نفر پوش", "پندار", "نایکی", "ادیداس", "پوما", "خارجی", "استاش", "براک", "میسپل", "دراس"];
        break;
    }
  } else if (department === "kids") {
    switch (category) {
      case "underwear":
      case "undershirts":
        brands = ["ساویس", "براک", "استاش", "خارجی", "کلونت", "میسپل"];
        break;
      case "socks":
        brands = ["کادنو", "ملودی", "نایکی"];
        break;
    }
  }

  return brands.map((brand) => ({ value: brand, label: brand }));
}
