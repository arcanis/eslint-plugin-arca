/**
 * @fileoverview A plugin to make Maël happy
 * @author Maël Nison
 * @copyright 2016 Maël Nison. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

import requireIndex from 'requireindex';

export const rules = requireIndex(`${__dirname}/rules`);
