import { Injectable } from '@nestjs/common';
import { PROJECT_CATEGORIES_METADATA, PROJECT_STATUSES_METADATA } from '../../common/taxonomy/project-categories';
import { SERVICE_CATEGORIES_METADATA } from '../../common/taxonomy/service-categories';
import { TECHNOLOGY_CATEGORIES_METADATA, TECHNOLOGY_GROUPS_METADATA, PROFICIENCY_LEVELS_METADATA } from '../../common/taxonomy/technology-taxonomy';
import { LINK_CATEGORIES_METADATA, LINK_PLATFORMS_METADATA } from '../../common/taxonomy/link-taxonomy';
import { CURRENCY_OPTIONS } from '../../common/taxonomy/currency-options';

@Injectable()
export class OptionsService {
  getOptions() {
    return {
      projectCategories: PROJECT_CATEGORIES_METADATA,
      serviceCategories: SERVICE_CATEGORIES_METADATA,
      technologyCategories: TECHNOLOGY_CATEGORIES_METADATA,
      technologyGroups: TECHNOLOGY_GROUPS_METADATA,
      linkCategories: LINK_CATEGORIES_METADATA,
      linkPlatforms: LINK_PLATFORMS_METADATA,
      currencies: CURRENCY_OPTIONS,
      projectStatuses: PROJECT_STATUSES_METADATA,
      proficiencyLevels: PROFICIENCY_LEVELS_METADATA,
    };
  }
}
