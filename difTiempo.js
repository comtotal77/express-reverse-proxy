function difTiempo(timeActJson, programado) {

  const meses = {
    'jan': 1,'feb': 2,'mar': 3,'apr': 4,'may': 5,'jun': 6,'jul': 7,'aug': 8,'sep': 9,
    'oct': 10,'nov': 11,'dec': 12
  };

  // Obtener la hora y la fecha de next-run y time
  const nextRunSplit = programado.split(" ");
  const nextRunDateStr = nextRunSplit[0];
  const nextRunTimeStr = nextRunSplit[1];
  const timeSplit = timeActJson["time"].split(":");
  const timeDate = new Date(
    `${timeActJson["date"]} ${timeSplit[0]}:${timeSplit[1]}:${timeSplit[2]}`
  );

  // Convertir la fecha de next-run a un objeto Date
  let nextRunDate;
  if (nextRunDateStr.includes("/")) {
    let nextRunSplit = nextRunDateStr.split("/");
    let nextRunMonth = nextRunSplit[0];
    nextRunMonth = meses[nextRunMonth];
    const nextRunDay = nextRunSplit[1];
    let nextRunYear
    if (nextRunSplit.length === 2){
      nextRunYear = "2023";
    } else {
      nextRunYear = nextRunSplit[2];
    }
    nextRunDate = new Date(
      `${nextRunMonth} ${nextRunDay}, ${nextRunYear} ${nextRunTimeStr}`
    );
  } else {
    nextRunDate = new Date(`January 1, 1970 ${nextRunTimeStr}`);
  }

  // Calcular la diferencia en milisegundos entre next-run y time
  const msDiff = nextRunDate.getTime() - timeDate.getTime();

  // Convertir la diferencia en milisegundos a días, horas, minutos y segundos
  const diffDays = Math.floor(msDiff / 1000 / 60 / 60 / 24);
  const diffHours = Math.floor(msDiff / 1000 / 60 / 60) % 24;
  const diffMinutes = Math.floor(msDiff / 1000 / 60) % 60;
  const diffSeconds = Math.floor(msDiff / 1000) % 60;

  // Imprimir el tiempo restante en formato "DD:HH:MM:SS"
  //console.log(`${diffDays.toString().padStart(2, "0")}:${diffHours.toString().padStart(2, "0")}:${diffMinutes.toString().padStart(2, "0")}:${diffSeconds.toString().padStart(2, "0")}`);
  return `${diffDays.toString().padStart(2, "0")}:${diffHours
    .toString()
    .padStart(2, "0")}:${diffMinutes.toString().padStart(2, "0")}:${diffSeconds
    .toString()
    .padStart(2, "0")}`;
}

module.exports = difTiempo;
