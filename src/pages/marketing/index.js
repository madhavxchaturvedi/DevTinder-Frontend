/**
 * Marketing Sub-Pages & Destination Routes
 *
 * Dedicated marketing architecture providing:
 * - FeaturesMatchPage (/features/match)
 * - FeaturesCollabPage (/features/collab)
 * - FeaturesFeedPage (/features/feed)
 * - FeaturesProjectsPage (/features/projects)
 * - PricingDestinationPage (/pricing)
 * - CommunityDestinationPage (/community)
 */

export { default as FeaturesMatchPage } from "./FeaturesMatchPage";
export { default as FeaturesCollabPage } from "./FeaturesCollabPage";
export { default as FeaturesFeedPage } from "./FeaturesFeedPage";
export { default as FeaturesProjectsPage } from "./FeaturesProjectsPage";
export { default as PricingDestinationPage } from "./PricingDestinationPage";
export { default as CommunityDestinationPage } from "./CommunityDestinationPage";

const marketingPages = {
  FeaturesMatchPage: () => import("./FeaturesMatchPage"),
  FeaturesCollabPage: () => import("./FeaturesCollabPage"),
  FeaturesFeedPage: () => import("./FeaturesFeedPage"),
  FeaturesProjectsPage: () => import("./FeaturesProjectsPage"),
  PricingDestinationPage: () => import("./PricingDestinationPage"),
  CommunityDestinationPage: () => import("./CommunityDestinationPage"),
};

export default marketingPages;
