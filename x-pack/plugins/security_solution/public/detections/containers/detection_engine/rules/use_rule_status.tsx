/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEffect, useRef, useState } from 'react';
import { isNotFoundError } from '@kbn/securitysolution-t-grid';
import { useAppToasts } from '../../../../common/hooks/use_app_toasts';

import { getRuleStatusById } from './api';
import * as i18n from './translations';
import { RuleStatus } from './types';

type Func = (ruleId: string) => void;
export type ReturnRuleStatus = [boolean, RuleStatus | null, Func | null];

/**
 * Hook for using to get a Rule from the Detection Engine API
 *
 * @param id desired Rule ID's (not rule_id)
 *
 */
export const useRuleStatus = (id: string | undefined | null): ReturnRuleStatus => {
  const [ruleStatus, setRuleStatus] = useState<RuleStatus | null>(null);
  const fetchRuleStatus = useRef<Func | null>(null);
  const [loading, setLoading] = useState(true);
  const { addError } = useAppToasts();

  useEffect(() => {
    let isSubscribed = true;
    const abortCtrl = new AbortController();

    const fetchData = async (idToFetch: string) => {
      try {
        setLoading(true);
        const ruleStatusResponse = await getRuleStatusById({
          id: idToFetch,
          signal: abortCtrl.signal,
        });

        if (isSubscribed) {
          setRuleStatus(ruleStatusResponse[id ?? '']);
        }
      } catch (error) {
        if (isSubscribed && !isNotFoundError(error)) {
          setRuleStatus(null);
          addError(error, { title: i18n.RULE_AND_TIMELINE_FETCH_FAILURE });
        }
      }
      if (isSubscribed) {
        setLoading(false);
      }
    };
    if (id != null) {
      fetchData(id);
    }
    fetchRuleStatus.current = fetchData;
    return () => {
      isSubscribed = false;
      abortCtrl.abort();
    };
  }, [id, addError]);

  return [loading, ruleStatus, fetchRuleStatus.current];
};
