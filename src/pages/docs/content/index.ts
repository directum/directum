// deno-lint-ignore-file no-sloppy-imports
import React from 'react';
import Introduction from './Introduction';
import ApiDocs from './ApiDocs';
import HowToList from './HowToList';
import HowWeReview from './HowWeReview';
import Tags from './Tags';
import BotDescriptions from './BotDescriptions';
import GettingFeatured from './GettingFeatured';
import JoiningTheTeam from './JoiningTheTeam';
import Contributors from './Contributors';

/**
 * DOCS_PAGES maps the URL slugs (like 'introduction') 
 * to the React components that contain the page content.
 */
export const DOCS_PAGES: Record<string, React.ComponentType> = {
  introduction: Introduction,
  API: ApiDocs,
  'how-to-list': HowToList,
  'how-we-review': HowWeReview,
  tags: Tags,
  'bot-descriptions': BotDescriptions,
  'getting-featured': GettingFeatured,
  'joining-the-team': JoiningTheTeam,
  contributors: Contributors,
  // Future pages will be added here, for example:
  // guidelines: Guidelines,
};

/**
 * NAVIGATION defines the sidebar structure.
 * This makes it easy to add new groups and links in one place.
 */
export const NAVIGATION = [
  {
    group: "Getting Started",
    items: [
      { id: "introduction", title: "Introduction" },
      { id: "API", title: "API Documentation" },
      { id: "how-to-list", title: "How to List Your Bot" },
    ]
  },
  {
    group: "Bot Management",
    items: [
      { id: "how-we-review", title: "How We Review Bots" },
      { id: "tags", title: "Tags & Categories" },
      { id: "bot-descriptions", title: "Bot Descriptions" },
      { id: "getting-featured", title: "Getting Featured" },
    ]
  },
  {
    group: "Miscellaneous",
    items: [
      { id: "joining-the-team", title: "Joining the Team" },
      { id: "contributors", title: "Contributors" },
    ]
  },
  // We will add more groups here as we create their files
];