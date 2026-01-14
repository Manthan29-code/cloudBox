# LOG SERVICE – Responsibilities

    > 
> (Internal helper, NO API, only functions)

### Purpose

Central place to ** create and manage log records **
    Called by:

- share controller
    - download handler
        - view handler

            * * *

## 1) Create Activity Log

Triggered when:

- share created
    - resource viewed
        - file downloaded

Flow:

1. receive:

- shareId
    - accessedBy
    - action
    - ip
    - userAgent
2. validate required fields
3. save log document
4. return success

    * * *

## 2) Batch Log(optional future)

Purpose:

- bulk insert logs
    - high traffic optimization

Used when:

- heavy view traffic

    * * *

## 3) Sanitize Log Data

Purpose:

- normalize IP
    - clean userAgent
        - prevent injection

            * * *

## 4) Reusable Log Helpers

Examples:

- format action names
    - generate metadata

        * * *

# LOG CONTROLLER – Responsibilities

    > 
> (Exposes APIs to frontend)

* * *

## 1) Get Logs by Share

Purpose:

- owner views activity

Flow:

1. validate owner
2. check share belongs to owner
3. fetch logs by shareId
4. apply:

- pagination
    - filters(action, date)
5. return data

    * * *

## 2) Get All Logs of User

Purpose:

- admin / user analytics

Examples:

- all activity by user
    - audit trail

        * * *

## 3) Log Analytics(optional later)

Purpose:

- total views
    - total downloads
        - unique users
            - last access

                * * *

## 4) Export Logs

Purpose:

- download CSV
    - reports