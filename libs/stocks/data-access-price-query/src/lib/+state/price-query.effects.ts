import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  StocksAppConfig,
  StocksAppConfigToken
} from '@coding-challenge/stocks/data-access-app-config';
import { Effect } from '@ngrx/effects';
import { DataPersistence } from '@nrwl/nx';
import { map } from 'rxjs/operators';
import {
  FetchPriceQuery,
  PriceQueryActionTypes,
  PriceQueryFetched,
  PriceQueryFetchError
} from './price-query.actions';
import { PriceQueryPartialState } from './price-query.reducer';
import { PriceQueryResponse } from './price-query.type';

@Injectable()
export class PriceQueryEffects {
  @Effect() loadPriceQuery$ = this.dataPersistence.fetch(
    PriceQueryActionTypes.FetchPriceQuery,
    {
      run: (action: FetchPriceQuery, state: PriceQueryPartialState) => {
        return this.httpClient
          .get(
            `${this.env.apiURL}/beta/stock/${action.symbol}/chart/max?token=${this.env.apiKey}`
          )
          .pipe(
            map((data:PriceQueryResponse[]) => {
              return data.filter(item => {
                const itemDate = new Date(item.date);
                // to allow comparison only of date fields, not time fields
                itemDate.setHours(0, 0, 0, 0);
                action.fromDate.setHours(0, 0, 0, 0);
                action.toDate.setHours(0, 0, 0, 0);
                return itemDate >= action.fromDate && itemDate <= action.toDate;
              });
             } ),
            map(resp => new PriceQueryFetched(resp as PriceQueryResponse[])),
          );
      },

      onError: (action: FetchPriceQuery, error) => {
        return new PriceQueryFetchError(error);
      }
    }
  );

  constructor(
    @Inject(StocksAppConfigToken) private env: StocksAppConfig,
    private httpClient: HttpClient,
    private dataPersistence: DataPersistence<PriceQueryPartialState>
  ) {}
}
