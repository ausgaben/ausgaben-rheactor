@After=Account
Feature: CheckingAccount
  As a user
  I should be able to create and fetch checking accounts
  so that I can track my spendings

  Background: Client defaults

    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Content-Type header
    Given "Bearer {tanjasToken}" is the Authorization header

  Scenario: Create a new checking account

    Given this is the request body
    --------------
    "name": "My first checking account"
    --------------
    When I POST to {createCheckingAccountEndpoint}
    Then the status code should be 201
    And I store the Location header as "createdCheckingAccount"

  Scenario: Fetch the created account

    When I GET {createdCheckingAccount}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.ausgaben.v1+json; charset=utf-8"
    And "$context" should equal "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#CheckingAccount"
    And "name" should equal "My first checking account"
    And "monthly" should equal false
    And "savings" should equal false
    And "$version" should equal 1
    And I store the link to the list "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Spending" as "ListSpendingsEndpoint"
    And I store the link to the list "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Category" as "ListCategoriesEndpoint"
    And I store the link to the list "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Title" as "ListTitlesEndpoint"
    And I store the link to "create-spending" as "CreateSpendingEndpoint"
    And I store the link to "create-periodical" as "CreatePeriodicalEndpoint"
    And I store the link to the list "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Periodical" as "ListPeriodicalsEndpoint"
    And I store the link of "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Report" as "createdCheckingAccountReport"

  Scenario: List all my accounts

    When I POST to {tanjasCheckingAccounts}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.ausgaben.v1+json; charset=utf-8"
    And a list of "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#CheckingAccount" with 1 of 1 item should be returned
    And "name" of the 1st item should equal "My first checking account"
