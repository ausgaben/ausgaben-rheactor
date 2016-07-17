@After=CheckingAccount
Feature: Spendings
  As a user
  I can add and retrieve the spendings for my checking account

  Background: Client defaults

    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Content-Type header
    Given "Bearer {tanjasToken}" is the Authorization header

  Scenario: Add spendings and fetch them

    Given this is the request body
    --------------
    "category": "[category]",
    "title": "[title]",
    "amount": [amount],
    "booked": [booked],
    "bookedAt": "[bookedAt]"
    --------------
    When I POST to {CreateSpendingEndpoint}
    Then the status code should be 201
    And I store the Location header as "createdSpending"
    When I GET {createdSpending}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.ausgaben.v1+json; charset=utf-8"
    And "$context" should equal "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Spending"
    And "$version" should equal 1
    And "category" should equal "[category]"
    And "title" should equal "[title]"
    And "amount" should equal [amount]
    And "booked" should equal [booked]
    And "bookedAt" should equal "[bookedAt]"
    And "saving" should equal false

  Where:
    category | title          | amount | booked | bookedAt
    Pets     | Cat food       | -12345 | true   | 2015-01-02T00:00:00.000Z
    Pets     | Dog food       | -5678  | true   | 2015-01-03T00:00:00.000Z
    Salary   | Markus' Salary | 1234   | true   | 2015-01-04T00:00:00.000Z
    Salary   | Tanja's Salary | 4321   | false  | 2015-01-04T00:00:00.000Z

  Scenario: Fetch all spendings for the account

    When I POST to {ListSpendingsEndpoint}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.ausgaben.v1+json; charset=utf-8"
    And a list of "https://github.com/ausgaben/ausgaben-rheactor/wiki/JsonLD#Spending" with 4 of 4 items should be returned
    And "title" of the 1st item should equal "Cat food"

  Scenario: Fetch summary for the account

    When I GET {createdCheckingAccount}
    Then "spendings" should equal -18023
    Then "income" should equal 1234
    Then "balance" should equal -16789
