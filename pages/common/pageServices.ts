import type { Logger } from '../../utils/Logger';
import type { FileUtility } from '../../utils/FileUtility';
import type { EnvUtility } from '../../utils/envUtility';
import type { UIAssertions } from '../../utils/assertion';
import type { UIActionUtils } from '../../utils/actions/UIActionUtils';

export interface OmsPageServices {
    uiActions: UIActionUtils;
    uiAssertions: UIAssertions;
    logger: Logger;
    fileUtils: FileUtility;
    env: EnvUtility;
}
