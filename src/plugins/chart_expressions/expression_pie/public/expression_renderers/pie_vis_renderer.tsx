/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { lazy } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nProvider } from '@kbn/i18n-react';
import { ExpressionRenderDefinition } from '../../../../expressions/public';
import { VisualizationContainer } from '../../../../visualizations/public';
import type { PersistedState } from '../../../../visualizations/public';
import { KibanaThemeProvider } from '../../../../kibana_react/public';

import { PIE_VIS_EXPRESSION_NAME } from '../../common/constants';
import { RenderValue } from '../../common/types';

import { VisTypePieDependencies } from '../plugin';

const PieComponent = lazy(() => import('../components/pie_vis_component'));

function shouldShowNoResultsMessage(visData: any): boolean {
  const rows: object[] | undefined = visData?.rows;
  const isZeroHits = visData?.hits === 0 || (rows && !rows.length);

  return Boolean(isZeroHits);
}

export const getPieVisRenderer: (
  deps: VisTypePieDependencies
) => ExpressionRenderDefinition<RenderValue> = ({ theme, palettes, getStartDeps }) => ({
  name: PIE_VIS_EXPRESSION_NAME,
  displayName: 'Pie visualization',
  reuseDomNode: true,
  render: async (domNode, { visConfig, visData, syncColors }, handlers) => {
    const showNoResult = shouldShowNoResultsMessage(visData);

    handlers.onDestroy(() => {
      unmountComponentAtNode(domNode);
    });

    const services = await getStartDeps();
    const palettesRegistry = await palettes.getPalettes();

    render(
      <I18nProvider>
        <KibanaThemeProvider theme$={services.kibanaTheme.theme$}>
          <VisualizationContainer handlers={handlers} showNoResult={showNoResult}>
            <PieComponent
              chartsThemeService={theme}
              palettesRegistry={palettesRegistry}
              visParams={visConfig}
              visData={visData}
              renderComplete={handlers.done}
              fireEvent={handlers.event}
              uiState={handlers.uiState as PersistedState}
              services={services.data}
              syncColors={syncColors}
            />
          </VisualizationContainer>
        </KibanaThemeProvider>
      </I18nProvider>,
      domNode
    );
  },
});
