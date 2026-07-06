const browserOf = (ua: string) => {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  if (/postman/i.test(ua)) return "Postman";
  if (/curl/i.test(ua)) return "curl";
  return "Unknown browser";
};

const osOf = (ua: string) => {
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ios/i.test(ua)) return "iOS";
  if (/mac os|macintosh/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown OS";
};

export const parseDevice = (userAgent?: string) => {
  if (!userAgent) return "Unknown device";
  return `${browserOf(userAgent)} on ${osOf(userAgent)}`;
};
