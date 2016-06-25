@After=Registration
Feature: User Profile
  As a user
  I want to fetch my profile
  so that I can fetch my accounts

  Background: Client defaults

    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Accept header
    Given "application/vnd.ausgaben.v1+json; charset=utf-8" is the Content-Type header

  Scenario: GET

    Given "Bearer {[storeName]Token}" is the Authorization header
    When I GET {[storeName]TokenJwt.sub}
    Then the status code should be 200
    And the Content-Type header should equal "application/vnd.ausgaben.v1+json; charset=utf-8"
    And "$context" should equal "https://github.com/RHeactor/nucleus/wiki/JsonLD#User"
    And "$id" should equal "{[storeName]TokenJwt.sub}"
    And "email" should equal "[email]"
    And "name" should equal "[firstname] [lastname]"
    And "firstname" should equal "[firstname]"
    And "lastname" should equal "[lastname]"
    And "password" should not exist

  Where:
    storeName | email                          | firstname | lastname
    tanjas    | tanja-{time}@ausgaben.example  | Tanja     | Tacker
    markus    | markus-{time}@ausgaben.example | Markus    | Tacker
