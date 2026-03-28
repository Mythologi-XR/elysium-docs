import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

interface FeatureFlagProps {
  /** Flag name — matches a key in docFlags.js pillars or a custom key in customFields.featureFlags */
  name: string;
  /** Content to show when the flag is enabled (default: children) */
  children: React.ReactNode;
  /** Optional fallback content when the flag is disabled */
  fallback?: React.ReactNode;
}

/**
 * Conditionally render content based on feature flags defined in docFlags.js.
 *
 * Usage in MDX:
 *   import FeatureFlag from '@site/src/components/FeatureFlag';
 *
 *   <FeatureFlag name="elysium-x">
 *     This content only shows when the elysium-x flag is enabled.
 *   </FeatureFlag>
 *
 *   <FeatureFlag name="wallet" fallback={<p>Coming soon.</p>}>
 *     Wallet documentation here.
 *   </FeatureFlag>
 */
export default function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps): React.ReactElement | null {
  const { siteConfig } = useDocusaurusContext();
  const flags = (siteConfig.customFields?.featureFlags ?? {}) as Record<string, boolean>;

  const isEnabled = flags[name] ?? false;

  if (isEnabled) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
