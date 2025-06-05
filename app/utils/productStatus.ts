export function getStatusByScore(score: number) {
  if (score >= 80) {
    return {
      status: "שופר",
      statusLabel: "שופר",
      statusColor: "bg-green-100 text-green-700",
    };
  } else if (score >= 60) {
    return {
      status: "סביר",
      statusLabel: "סביר",
      statusColor: "bg-yellow-100 text-yellow-700",
    };
  } else {
    return {
      status: "דורש שיפור",
      statusLabel: "דורש שיפור",
      statusColor: "bg-red-100 text-red-600",
    };
  }
}
