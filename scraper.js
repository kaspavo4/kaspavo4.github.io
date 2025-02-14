import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]  // Oprava pro GitHub Actions
    });

    const page = await browser.newPage();
    const url = "https://czechsoftball.wbsc.org/cs/events/extraliga-mu-2024/stats/general/all";

    await page.goto(url, { waitUntil: "networkidle2" });

    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");
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

    // Přidání timestampu, aby se vždy commitla změna
    const output = {
      scrapedAt: new Date().toISOString(),
      data: data
    };

    const filePath = "./data/player_stats.json";
    fs.mkdirSync("./data", { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(output, nu
