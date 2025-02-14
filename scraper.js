import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  try {
    // Spustíme prohlížeč
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const url = "https://czechsoftball.wbsc.org/cs/events/extraliga-mu-2024/stats/general/all";

    // Načteme URL stránky
    await page.goto(url, { waitUntil: "networkidle2" });

    // Vybereme požadovaná data (tabulka s výsledky)
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr"); // Výběr řádků tabulky
      let results = [];

      rows.forEach((row) => {
        const columns = row.querySelectorAll("td");
        const rowData = [];
        columns.forEach((col) => {
          rowData.push(col.innerText.trim());
        });
        results.push(rowData);
      });

      return results;
    });

    // Uložíme data do JSON souboru
    const filePath = "./data/player_stats.json";
    fs.mkdirSync("./data", { recursive: true }); // Vytvoří složku, pokud neexistuje
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Data byla úspěšně uložena do ${filePath}`);

    // Zavřeme prohlížeč
    await browser.close();
  } catch (error) {
    console.error("Chyba při scrapování:", error);
  }
})();
