function formatDate (isoString: string) {
  return new Date(isoString).toISOString().slice(0, 16).replace('T', ' ')
}

export default formatDate