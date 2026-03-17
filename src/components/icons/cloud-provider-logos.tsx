"use client";

import { SiGooglecloud } from "@icons-pack/react-simple-icons";

/**
 * 云厂商 Logo 组件 - 使用官方品牌 logo
 * AWS/Azure: 通过 Simple Icons CDN 加载
 * GCP: 使用 @icons-pack/react-simple-icons 的 SiGooglecloud
 */

const GCP_BLUE = "#4285F4";

// AWS - 使用 Simple Icons CDN (amazonwebservices)
const AwsLogo = ({ className, size = 48 }: { className?: string; size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="https://cdn.simpleicons.org/amazonwebservices/FF9900"
    alt=""
    width={size}
    height={size}
    className={className}
  />
);

// Azure - 使用 Simple Icons CDN (microsoftazure)
const AzureLogo = ({ className, size = 48 }: { className?: string; size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="https://cdn.simpleicons.org/microsoftazure/0078D4"
    alt=""
    width={size}
    height={size}
    className={className}
  />
);

// GCP - 使用 SiGooglecloud 组件
const GcpLogo = ({ className, size = 48 }: { className?: string; size?: number }) => (
  <SiGooglecloud color={GCP_BLUE} size={size} className={className} aria-hidden />
);

export const CloudProviderLogos = {
  AWS: AwsLogo,
  Azure: AzureLogo,
  GCP: GcpLogo,
};
